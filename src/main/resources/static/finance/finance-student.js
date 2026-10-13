// Student finance page: own invoices, payment history and revision requests.
const user = requireRole(['STUDENT']);

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function money(n) {
    return 'LKR ' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function monthText(d) {
    return d ? String(d).substring(0, 7) : '';
}
function emptyRow(cols, text) {
    return `<tr><td colspan="${cols}" class="fin-empty">${text}</td></tr>`;
}

function showTab(name) {
    ['invoices', 'payments', 'revisions'].forEach(t => {
        document.getElementById('tab-' + t).classList.toggle('hidden', t !== name);
        document.getElementById('tab-btn-' + t).classList.toggle('active', t === name);
    });
}

async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Server error ' + res.status);
    return res.json();
}

async function loadInvoices() {
    const body = document.getElementById('invoice-body');
    try {
        const rows = await getJson(`/api/invoices/student/${user.id}`);
        let billed = 0, paid = 0, balance = 0;
        rows.forEach(r => {
            if (r.status === 'VOID') return;
            billed += Number(r.amount); paid += Number(r.amountPaid); balance += Number(r.balance);
        });
        document.getElementById('sum-billed').innerText = money(billed);
        document.getElementById('sum-paid').innerText = money(paid);
        document.getElementById('sum-balance').innerText = money(balance);
        body.innerHTML = rows.length === 0 ? emptyRow(7, 'You have no invoices yet.') : rows.map(r => `<tr>
            <td>${esc(r.batchName)}</td>
            <td>${monthText(r.billingMonth)}</td>
            <td>${money(r.amount)}</td>
            <td>${money(r.amountPaid)}</td>
            <td><strong>${money(r.balance)}</strong></td>
            <td>${esc(r.dueDate)}</td>
            <td><span class="badge badge-${esc(r.status)}">${esc(r.status)}</span>${r.overdue ? '<span class="badge badge-overdue">OVERDUE</span>' : ''}</td>
        </tr>`).join('');
    } catch (e) {
        body.innerHTML = emptyRow(7, 'Could not load invoices.');
        showToast('Could not load invoices.', false);
    }
}

async function loadPayments() {
    const body = document.getElementById('payment-body');
    try {
        const rows = await getJson(`/api/payments/student/${user.id}`);
        body.innerHTML = rows.length === 0 ? emptyRow(7, 'No payments recorded yet.') : rows.map(p => `<tr>
            <td>${esc(p.paidOn)}</td>
            <td>${esc(p.batchName)}</td>
            <td>${monthText(p.billingMonth)}</td>
            <td><strong>${money(p.amount)}</strong></td>
            <td>${esc(String(p.method || '').replace('_', ' '))}</td>
            <td>${esc(p.referenceNo || '')}</td>
            <td>${esc(p.notes || '')}</td>
        </tr>`).join('');
    } catch (e) {
        body.innerHTML = emptyRow(7, 'Could not load payments.');
    }
}

async function loadMyClasses() {
    const select = document.getElementById('rev-batch');
    try {
        const enrollments = await getJson(`/api/enrollments/student/${user.id}`);
        const active = enrollments.filter(e => e.status === 'ACTIVE' && e.courseBatch);
        select.innerHTML = active.length === 0
            ? '<option value="">You are not enrolled in any class</option>'
            : active.map(e => `<option value="${e.courseBatch.batchId}">${esc(e.courseBatch.batchName)}</option>`).join('');
    } catch (e) {
        select.innerHTML = '<option value="">Could not load classes</option>';
    }
}

async function loadRevisions() {
    const body = document.getElementById('revision-body');
    try {
        const rows = await getJson(`/api/revision-proposals/student/${user.id}`);
        body.innerHTML = rows.length === 0 ? emptyRow(6, 'You have not sent any requests yet.') : rows.map(r => `<tr>
            <td>${esc(String(r.createdAt || '').replace('T', ' ').substring(0, 16))}</td>
            <td>${esc(r.batchName)}</td>
            <td><strong>${esc(r.topic)}</strong>${r.reason ? '<div style="color: var(--muted); font-size: 13px;">' + esc(r.reason) + '</div>' : ''}</td>
            <td>${esc(r.preferredDate || '')}</td>
            <td><span class="badge badge-${esc(r.status)}">${esc(r.status)}</span></td>
            <td>${esc(r.tutorResponse || '')}</td>
        </tr>`).join('');
    } catch (e) {
        body.innerHTML = emptyRow(6, 'Could not load requests.');
    }
}

async function submitRevision() {
    const batchId = document.getElementById('rev-batch').value;
    const topic = document.getElementById('rev-topic').value.trim();
    if (!batchId) { showToast('Please choose a class.', false); return; }
    if (!topic) { showToast('Please enter a topic.', false); return; }
    const payload = {
        studentId: user.id,
        batchId: Number(batchId),
        topic: topic,
        reason: document.getElementById('rev-reason').value.trim() || null,
        preferredDate: document.getElementById('rev-date').value || null
    };
    try {
        const res = await fetch('/api/revision-proposals', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast('Your request has been sent.', true);
            document.getElementById('rev-topic').value = '';
            document.getElementById('rev-reason').value = '';
            document.getElementById('rev-date').value = '';
            loadRevisions();
        } else {
            showToast(await res.text(), false);
        }
    } catch (e) {
        showToast('Could not reach the server.', false);
    }
}

if (user) {
    loadInvoices();
    loadPayments();
    loadMyClasses();
    loadRevisions();
}
