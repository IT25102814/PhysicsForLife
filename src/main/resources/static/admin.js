// Administrator login, settings and question management.
let adminQuizConfig = { title: "Physics Assessment", timeLimitMinutes: 10, maxQuestions: 10 };

async function loginAdmin() {
    const usernameInput = document.getElementById("admin-user-input").value || "admin";
    const passwordInput = document.getElementById("admin-pass-input").value;

    try {
        const res = await fetch(`${BASE_URL}/admin/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        if (res.ok) {
            document.getElementById("admin-error").classList.add("hidden");
            document.getElementById("admin-login-card").classList.add("hidden");
            document.getElementById("admin-dashboard").classList.remove("hidden");
        } else {
            document.getElementById("admin-error").innerText = "Incorrect Admin Credentials!";
            document.getElementById("admin-error").classList.remove("hidden");
        }
    } catch(err) {
        document.getElementById("admin-error").innerText = "Connection failed! Check Spring Boot.";
        document.getElementById("admin-error").classList.remove("hidden");
    }
}

function logoutAdmin() {
    document.getElementById("admin-pass-input").value = "";
    document.getElementById("admin-dashboard").classList.add("hidden");
    document.getElementById("admin-login-card").classList.remove("hidden");
}

async function changeAdminPassword() {
    const oldPassword = document.getElementById("old-pass").value;
    const newPassword = document.getElementById("new-pass").value;
    try {
        const res = await fetch(`${BASE_URL}/admin/change-password`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        alert(await res.text());
    } catch (err) {
        alert("Failed to connect to the server.");
    }
}

async function saveFullQuizConfig() {
    adminQuizConfig.title = document.getElementById("title-input").value || "New Quiz";
    adminQuizConfig.timeLimitMinutes = parseInt(document.getElementById("time-input").value) || 10;
    adminQuizConfig.maxQuestions = parseInt(document.getElementById("count-input").value) || 10;

    try {
        const res = await fetch(`${BASE_URL}/admin/config`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adminQuizConfig)
        });
        alert(await res.text());
    } catch (err) {
        console.error(err);
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
        alert("Fill question, options A/B, and select a correct answer!");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/admin/add-question`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        alert(await res.text());
        if (res.ok) { clearQuestionForm(); }
    } catch(err) {
        console.error(err);
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
        alert(await res.text());
    } catch(err) {
        console.error(err);
    }
}