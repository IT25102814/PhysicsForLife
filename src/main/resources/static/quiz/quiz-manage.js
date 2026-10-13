// Tutor / Admin quiz management: quiz settings, questions and student results.
let adminQuizConfig = { title: "Physics Assessment", timeLimitMinutes: 10, maxQuestions: 10 };




async function saveFullQuizConfig() {
    adminQuizConfig.title = document.getElementById("title-input").value || "New Quiz";
    adminQuizConfig.timeLimitMinutes = parseInt(document.getElementById("time-input").value) || 10;
    adminQuizConfig.maxQuestions = parseInt(document.getElementById("count-input").value) || 10;

    try {
        const res = await fetch(`${BASE_URL}/admin/config`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adminQuizConfig)
        });
        showToast(await res.text(), res.ok);
    } catch (err) {
        console.error(err);
        showToast("Could not reach the server.", false);
    }
}

function toggleQuestionType() {
    const type = document.getElementById("q-type").value;
    const rowCD = document.getElementById("row-cd");
    const optA = document.getElementById("opt-a");
    const optB = document.getElementById("opt-b");
    const optC = document.getElementById("opt-c");
    const optD = document.getElementById("opt-d");

    const singleSelect = document.getElementById("correct-single-opt");
    const multiDiv = document.getElementById("mcq-multi-options");
    const dndInput = document.getElementById("correct-dnd-input");
    const dndHint = document.getElementById("dnd-hint");

    optA.readOnly = false; optB.readOnly = false;
    rowCD.classList.remove("hidden");
    document.getElementById("opt-c-val").disabled = false;
    document.getElementById("opt-d-val").disabled = false;

    singleSelect.classList.add("hidden");
    multiDiv.classList.add("hidden");
    multiDiv.style.display = "none";
    dndInput.classList.add("hidden");
    dndHint.classList.add("hidden");

    if (type === 'tf') {
        rowCD.classList.add("hidden");
        optA.value = "True"; optA.readOnly = true;
        optB.value = "False"; optB.readOnly = true;
        optC.value = ""; optD.value = "";

        singleSelect.classList.remove("hidden");
        document.getElementById("opt-c-val").disabled = true;
        document.getElementById("opt-d-val").disabled = true;
        if (singleSelect.value === 'C' || singleSelect.value === 'D') singleSelect.value = 'A';

    } else if (type === 'dnd') {
        dndInput.classList.remove("hidden");
        dndHint.classList.remove("hidden");
        dndInput.placeholder = "Type correct order (e.g., A,B,C)";
        optA.value = ""; optB.value = ""; optC.value = ""; optD.value = "";

    } else if (type === 'mcq-multi') {
        multiDiv.classList.remove("hidden");
        multiDiv.style.display = "flex";

    } else {
        singleSelect.classList.remove("hidden");
    }
}

async function addQuestion() {
    const type = document.getElementById("q-type").value;
    let finalCorrectOption = "";

    if (type === 'mcq-multi') {
        const checked = Array.from(document.querySelectorAll('.mcq-cb:checked')).map(cb => cb.value);
        finalCorrectOption = checked.join(',');
    } else if (type === 'dnd') {
        finalCorrectOption = document.getElementById("correct-dnd-input").value;
    } else {
        finalCorrectOption = document.getElementById("correct-single-opt").value;
    }

    const payload = {
        questionText: document.getElementById("q-input").value + "::TYPE::" + type,
        optionA: document.getElementById("opt-a").value,
        optionB: document.getElementById("opt-b").value,
        optionC: document.getElementById("opt-c").value,
        optionD: document.getElementById("opt-d").value,
        correctOption: finalCorrectOption,
        explanation: document.getElementById("q-explanation").value
    };

    if (!document.getElementById("q-input").value || !payload.optionA || !payload.optionB || !finalCorrectOption) {
        showToast("Fill the question, options A/B, and select a correct answer!", false);
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/admin/add-question`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        showToast(await res.text(), res.ok);
        if (res.ok) { clearQuestionForm(); }
    } catch(err) {
        console.error(err);
        showToast("Could not reach the server.", false);
    }
}

function clearQuestionForm() {
    ["q-input", "opt-a", "opt-b", "opt-c", "opt-d", "q-explanation", "correct-dnd-input"].forEach(id => document.getElementById(id).value = "");
    document.querySelectorAll('.mcq-cb').forEach(cb => cb.checked = false);
    document.getElementById("q-type").value = "mcq-single";
    toggleQuestionType();
}

async function clearAllQuestions() {
    if (!confirm("Delete ALL questions for this quiz?")) return;
    try {
        const res = await fetch(`${BASE_URL}/admin/clear-questions`, { method: "POST" });
        showToast(await res.text(), res.ok);
    } catch(err) {
        console.error(err);
        showToast("Could not reach the server.", false);
    }
}
// ---------- Results & analytics (real data from the database) ----------
async function loadResults() {
    const box = document.getElementById("results-body");
    const wrap = document.getElementById("results-view");
    wrap.classList.remove("hidden");
    triggerAnimation("results-view");
    try {
        const res = await fetch(`${BASE_URL}/admin/results`);
        if (!res.ok) throw new Error("Server error " + res.status);
        const rows = await res.json();
        if (rows.length === 0) {
            box.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);">No student has completed this quiz yet.</td></tr>';
            document.getElementById("results-summary").innerText = "";
            drawChart([], 'tutorChart', 'horizontalBar');
            return;
        }
        box.innerHTML = rows.map(r => `<tr>
            <td>${escapeHtml(r.studentName)}</td>
            <td>${r.correctCount} / ${r.totalQuestions}</td>
            <td><strong>${r.mark}</strong></td>
            <td>${r.submittedAt ? String(r.submittedAt).replace('T', ' ').substring(0, 16) : ''}</td>
            <td>${r.quizId}</td></tr>`).join("");
        const avg = rows.reduce((s, r) => s + Number(r.mark), 0) / rows.length;
        document.getElementById("results-summary").innerText =
            `Students: ${rows.length}   |   Class average: ${avg.toFixed(1)}%`;
        drawChart(rows.map(r => ({ label: r.studentName, percentage: Number(r.mark) })), 'tutorChart', 'horizontalBar');
    } catch (err) {
        box.innerHTML = '<tr><td colspan="5" style="color:var(--red);">Could not load results: ' + err.message + '</td></tr>';
    }
}

function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
