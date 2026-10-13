// Tutor / Admin finance page: invoices, recording payments, outstanding balances, revision requests.
const user = requireRole(['TUTOR', 'ADMIN']);
let allInvoices = [];

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
async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Server error ' + res.status);
    return res.json();
}

function showTab(name) {
    ['invoices', 'outstanding', 'history', 'revisions'].forEach(t => {
        document.getElementById('tab-' + t).classList.toggle('hidden', t !== name);
        document.getElementById('tab-btn-' + t).classList.toggle('active', t === name);
    });
}

// ---------- classes for the "generate" form ----------
async function loadBatches() {
    const select = document.getElementById('gen-batch');
    try {
        const batches = await getJson('/api/management/batches');
        select.innerHTML = batches.map(b => {
            const inst = b.institute ? ' - ' + b.institute.name : '';
            return `<option value="${b.batchId}">${esc(b.batchName + inst)} (LKR ${b.monthlyFee})</option>`;
        }).join('');
    } catch (e) {
        select.innerHTML = '<option value="">Could not load classes</option>';
    }
    // default month = this month
    const now = new Date();
    document.getElementById('gen-month').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
}

async function generateInvoices() {
    const batchId = document.getElementById('gen-batch').value;
    const month = document.getElementById('gen-month').value;   // e.g. 2026-10
    if (!batchId || !month) { showToast('Choose a class and a month.', false); return; }
    try {
        const res = await fetch(`/api/invoices/generate?batchId=${batchId}&month=${month}-01&generatedBy=${user.id}`, { method: 'POST' });
        if (res.ok) {
            const r = await res.json();
            showToast(`${r.created} invoice(s) created, ${r.alreadyExisted} already existed.`, true);
            loadAll();
        } else {
            showToast(await res.text(), false);
        }
    } catch (e) {
        showToast('Could not reach the server.', false);
    }
}

// ---------- invoices ----------
async function loadInvoices() {
    try {
        allInvoices = await getJson('/api/invoices');
        let billed = 0, paid = 0, balance = 0;
        allInvoices.forEach(r => {
            if (r.status === 'UNPAID' || r.status === 'PARTIAL') {
                billed += Number(r.amount); paid += Number(r.amountPaid); balance += Number(r.balance);
            }
        });
        document.getElementById('sum-billed').innerText = money(billed);
        document.getElementById('sum-paid').innerText = money(paid);
        document.getElementById('sum-balance').innerText = money(balance);
        renderInvoices();
    } catch (e) {
        document.getElementById('invoice-body').innerHTML = emptyRow(9, 'Could not load invoices.');
    }
}

function renderInvoices() {
    const filter = document.getElementById('inv-filter').value;
    const rows = allInvoices.filter(r => {
        if (filter === 'all') return true;
        if (filter === 'open') return r.status === 'UNPAID' || r.status === 'PARTIAL';
        if (filter === 'overdue') return r.overdue;
        return r.status === filter;
    });
    const body = document.getElementById('invoice-body');
    if (rows.length === 0) { body.innerHTML = emptyRow(9, 'No invoices to show.'); return; }
    body.innerHTML = rows.map(r => {
        const canPay = (r.status === 'UNPAID' || r.status === 'PARTIAL');
        return `<tr>
            <td>${esc(r.studentName)}</td>
            <td>${esc(r.batchName)}</td>
            <td>${monthText(r.billingMonth)}</td>
            <td>${money(r.amount)}</td>
            <td>${money(r.amountPaid)}</td>
            <td><strong>${money(r.balance)}</strong></td>
            <td>${esc(r.dueDate)}</td>
            <td><span class="badge badge-${esc(r.status)}">${esc(r.status)}</span>${r.overdue ? '<span class="badge badge-overdue">OVERDUE</span>' : ''}</td>
            <td>${canPay ? `<button class="fin-btn small green" onclick="togglePayForm(${r.invoiceId}, ${r.balance})">Record payment</button>` : ''}</td>
        </tr>
        <tr class="pay-row hidden" id="payrow-${r.invoiceId}"><td colspan="9">
            <div class="fin-form">
                <div><label>Amount (LKR)</label><input type="number" step="0.01" min="0.01" max="${r.balance}" id="pay-amount-${r.invoiceId}" value="${r.balance}"></div>
                <div><label>Method</label>
                    <select id="pay-method-${r.invoiceId}">
                        <option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option>
                        <option value="CARD">Card</option><option value="ONLINE">Online</option>
                    </select></div>
                <div><label>Reference no. (optional)</label><input type="text" id="pay-ref-${r.invoiceId}" maxlength="60"></div>
                <div><label>Paid on</label><input type="date" id="pay-date-${r.invoiceId}" value="${new Date().toISOString().substring(0, 10)}"></div>
                <div><label>Notes (optional)</label><input type="text" id="pay-notes-${r.invoiceId}" maxlength="255"></div>
                <div><button class="fin-btn green" onclick="savePayment(${r.invoiceId})">Save payment</button>
                     <button class="fin-btn grey" onclick="togglePayForm(${r.invoiceId})">Cancel</button></div>
            </div>
        </td></tr>`;
    }).join('');
}

function togglePayForm(invoiceId) {
    document.getElementById('payrow-' + invoiceId).classList.toggle('hidden');
}

async function savePayment(invoiceId) {
    const amount = Number(document.getElementById('pay-amount-' + invoiceId).value);
    if (!(amount > 0)) { showToast('Enter an amount greater than zero.', false); return; }
    const payload = {
        invoiceId: invoiceId,
        amount: amount,
        method: document.getElementById('pay-method-' + invoiceId).value,
        referenceNo: document.getElementById('pay-ref-' + invoiceId).value.trim() || null,
        paidOn: document.getElementById('pay-date-' + invoiceId).value || null,
        notes: document.getElementById('pay-notes-' + invoiceId).value.trim() || null,
        recordedBy: user.id
    };
    try {
        const res = await fetch('/api/payments', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast('Payment recorded.', true);
            loadAll();
        } else {
            showToast(await res.text(), false);
        }
    } catch (e) {
        showToast('Could not reach the server.', false);
    }
}

// ---------- outstanding + payment history ----------
async function loadOutstanding() {
    const body = document.getElementById('outstanding-body');
    try {
        const rows = await getJson('/api/invoices/outstanding');
        body.innerHTML = rows.length === 0 ? emptyRow(6, 'No student owes any money. 🎉') : rows.map(r => `<tr>
            <td>${esc(r.studentName)}</td>
            <td>${r.unpaidInvoices}</td>
            <td>${money(r.totalBilled)}</td>
            <td>${money(r.totalPaid)}</td>
            <td><strong style="color: var(--red);">${money(r.outstanding)}</strong></td>
            <td>${esc(r.oldestDueDate)}</td>
        </tr>`).join('');
    } catch (e) {
        body.innerHTML = emptyRow(6, 'Could not load balances.');
    }
}

async function loadPayments() {
    const body = document.getElementById('payment-body');
    try {
        const rows = await getJson('/api/payments');
        body.innerHTML = rows.length === 0 ? emptyRow(8, 'No payments recorded yet.') : rows.map(p => `<tr>
            <td>${esc(p.paidOn)}</td>
            <td>${esc(p.studentName)}</td>
            <td>${esc(p.batchName)}</td>
            <td>${monthText(p.billingMonth)}</td>
            <td><strong>${money(p.amount)}</strong></td>
            <td>${esc(String(p.method || '').replace('_', ' '))}</td>
            <td>${esc(p.referenceNo || '')}</td>
            <td>${esc(p.notes || '')}</td>
        </tr>`).join('');
    } catch (e) {
        body.innerHTML = emptyRow(8, 'Could not load payments.');
    }
}

// ---------- revision requests ----------
async function loadRevisions() {
    const body = document.getElementById('revision-body');
    try {
        const rows = await getJson('/api/revision-proposals');
        document.getElementById('sum-pending').innerText = rows.filter(r => r.status === 'PENDING').length;
        body.innerHTML = rows.length === 0 ? emptyRow(7, 'No revision requests yet.') : rows.map(r => `<tr>
            <td>${esc(String(r.createdAt || '').replace('T', ' ').substring(0, 16))}</td>
            <td>${esc(r.studentName)}</td>
            <td>${esc(r.batchName)}</td>
            <td><strong>${esc(r.topic)}</strong>${r.reason ? '<div style="color: var(--muted); font-size: 13px;">' + esc(r.reason) + '</div>' : ''}</td>
            <td>${esc(r.preferredDate || '')}</td>
            <td><span class="badge badge-${esc(r.status)}">${esc(r.status)}</span></td>
            <td>${r.status === 'PENDING'
                ? `<div style="display:flex; gap:6px; flex-wrap:wrap;">
                     <select id="rev-decision-${r.proposalId}">
                        <option value="ACCEPTED">Accept</option><option value="SCHEDULED">Scheduled</option><option value="DECLINED">Decline</option>
                     </select>
                     <input type="text" id="rev-reply-${r.proposalId}" placeholder="Reply to student" style="min-width:160px;">
                     <button class="fin-btn small" onclick="reviewRevision(${r.proposalId})">Send</button>
                   </div>`
                : esc(r.tutorResponse || '')}</td>
        </tr>`).join('');
    } catch (e) {
        body.innerHTML = emptyRow(7, 'Could not load requests.');
    }
}

async function reviewRevision(id) {
    const decision = document.getElementById('rev-decision-' + id).value;
    const reply = document.getElementById('rev-reply-' + id).value.trim();
    const url = `/api/revision-proposals/${id}/review?decision=${decision}&reviewedBy=${user.id}&tutorResponse=${encodeURIComponent(reply)}`;
    try {
        const res = await fetch(url, { method: 'PUT' });
        if (res.ok) {
            showToast('Reply sent to the student.', true);
            loadRevisions();
        } else {
            showToast(await res.text(), false);
        }
    } catch (e) {
        showToast('Could not reach the server.', false);
    }
}

function loadAll() {
    loadInvoices();
    loadOutstanding();
    loadPayments();
    loadRevisions();
}

if (user) {
    loadBatches();
    loadAll();
}
