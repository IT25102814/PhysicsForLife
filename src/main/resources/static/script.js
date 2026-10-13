const BASE_URL = "http://localhost:8081/api/quiz";

let quizQuestions = [];
let currentQIndex = 0;
let score = 0;
let timeRemaining = 0;
let timerInterval = null;
let progressChartInstance = null;
let currentAssessmentId = 1;

let adminQuizConfig = { title: "Physics Assessment", timeLimitMinutes: 10, maxQuestions: 10 };

function triggerAnimation(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('fade-in-up');
    void el.offsetWidth;
    el.classList.add('fade-in-up');
}

window.switchView = function(view) {
    document.getElementById("btn-student-view").classList.toggle("active", view === 'student');
    document.getElementById("btn-admin-view").classList.toggle("active", view === 'admin');
    document.getElementById("student-section").classList.toggle("hidden", view !== 'student');
    document.getElementById("admin-section").classList.toggle("hidden", view !== 'admin');
    document.getElementById('logoutBtn').classList.toggle('hidden', view !== 'admin');
    triggerAnimation(view + '-section');
}

async function startStudentQuiz() {
    try {
        const response = await fetch(`${BASE_URL}/student/data`);
        const data = await response.json();

        quizQuestions = data.questions;
        if (!quizQuestions || quizQuestions.length === 0) {
            alert("No questions available in the database!");
            return;
        }

        const progressRes = await fetch(`${BASE_URL}/student/1/progress`);
        const progressData = await progressRes.json();

        if (Array.isArray(progressData) && progressData.some(result => result.quizId === data.quizId)) {
            alert("You have already completed this assessment. You cannot attempt a quiz twice.");
            return;
        }

        currentAssessmentId = data.quizId;
        timeRemaining = (data.timeLimitMinutes || 5) * 60;
        currentQIndex = 0;
        score = 0;

        document.getElementById("display-quiz-title").innerText = data.title;
        document.getElementById("student-start-card").classList.add("hidden");
        document.getElementById("student-quiz-card").classList.remove("hidden");
        triggerAnimation('student-quiz-card');

        startTimer();
        renderQuestion();
    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Failed to fetch records. Check if Spring Boot is running.");
    }
}

function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) { clearInterval(timerInterval); finishQuiz(true); }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    document.getElementById("time-left").innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function renderQuestion() {
    document.getElementById("next-q-btn").classList.add("hidden");
    document.getElementById("explanation-box").classList.add("hidden");
    document.getElementById("question-text").style.color = "#333";

    const q = quizQuestions[currentQIndex];
    document.getElementById("q-counter").innerText = `Question ${currentQIndex + 1} of ${quizQuestions.length}`;

    const optContainer = document.getElementById("options-list");
    optContainer.innerHTML = "";

    const optionsArray = [
        { label: 'A', text: q.optionA }, { label: 'B', text: q.optionB },
        { label: 'C', text: q.optionC }, { label: 'D', text: q.optionD }
    ].filter(opt => opt.text && opt.text.trim() !== "");

    let rawText = q.questionText || "";
    let qType = 'mcq-single';

    if (rawText.includes("::TYPE::")) {
        const typeParts = rawText.split("::TYPE::");
        qType = typeParts.pop();
        rawText = typeParts.join("::TYPE::");
    } else {
        if (rawText.includes("[blank]") || rawText.includes("[]") || rawText.includes("[ ]") || rawText.includes("___")) {
            qType = 'dnd';
        } else if (q.correctOption && q.correctOption.includes(",")) {
            qType = 'mcq-multi';
        } else if (!q.optionC && !q.optionD) {
            qType = 'tf';
        }
    }

    if (qType === 'dnd') {
        let maxBlanks = optionsArray.length;
        let currentBlanks = 0;

        // Strict string replacement - 100% immune to regex corruption
        let standardizedText = rawText
            .split("[blank]").join("###")
            .split("[]").join("###")
            .split("[ ]").join("###")
            .split("<blank>").join("###")
            .split("___").join("###");

        let textParts = standardizedText.split("###");
        let parsedText = textParts[0];

        for (let i = 1; i < textParts.length; i++) {
            currentBlanks++;
            if (currentBlanks <= maxBlanks) {
                parsedText += '<span class="drop-zone empty" ondragover="handleDragOver(event)" ondrop="handleDropInZone(event)"></span>';
            }
            parsedText += textParts[i];
        }

        document.getElementById("question-text").innerHTML = parsedText;

        const dndTray = document.createElement("div");
        dndTray.className = "dnd-tray fade-in-up";
        dndTray.id = "dnd-tray";
        dndTray.ondragover = handleDragOver;
        dndTray.ondrop = handleDropInZone;

        optionsArray.forEach(opt => {
            const item = document.createElement("div");
            item.className = "dnd-pill";
            item.draggable = true;
            item.dataset.label = opt.label;
            item.innerText = opt.text;
            item.ondragstart = handleDragStart;
            dndTray.appendChild(item);
        });

        optContainer.appendChild(dndTray);

        const submitBtn = document.createElement("button");
        submitBtn.className = "fade-in-up";
        submitBtn.style.marginTop = "20px";
        submitBtn.style.width = "100%";
        submitBtn.innerText = "Submit Answers";
        submitBtn.onclick = () => verifyDND(q.correctOption, q.explanation, submitBtn, rawText);
        optContainer.appendChild(submitBtn);

    } else {
        document.getElementById("question-text").innerText = rawText;
        const isMultiCorrect = (qType === 'mcq-multi');

        optionsArray.forEach(opt => {
            const label = document.createElement("label");
            label.className = "opt-cb-label fade-in-up";

            const input = document.createElement("input");
            input.type = isMultiCorrect ? "checkbox" : "radio";
            input.name = "mcq-answer";
            input.value = opt.label;
            input.className = "opt-input";

            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${opt.label}. ${opt.text}`));
            optContainer.appendChild(label);
        });

        const submitBtn = document.createElement("button");
        submitBtn.className = "fade-in-up";
        submitBtn.style.marginTop = "15px";
        submitBtn.style.width = "100%";
        submitBtn.innerText = "Submit Answer";
        submitBtn.onclick = () => verifyMCQ(q.correctOption, q.explanation, submitBtn);
        optContainer.appendChild(submitBtn);
    }
}

// DRAG AND DROP ENGINE
let draggedEl = null;

function handleDragStart(e) {
    draggedEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.label);
}

function handleDragOver(e) { e.preventDefault(); }

function handleDropInZone(e) {
    e.preventDefault();
    if (!draggedEl) return;

    let target = e.target;
    if (target.classList.contains('dnd-pill')) { target = target.parentElement; }

    const dndTray = document.getElementById('dnd-tray');

    if (target.classList.contains('drop-zone')) {
        if (target.children.length > 0 && target.children[0] !== draggedEl) {
            dndTray.appendChild(target.children[0]);
        }

        const oldParent = draggedEl.parentElement;
        target.appendChild(draggedEl);
        target.classList.remove('empty');

        if (oldParent && oldParent.classList.contains('drop-zone') && oldParent !== target) {
            oldParent.classList.add('empty');
        }
    }
    else if (target === dndTray || target.id === 'dnd-tray') {
        const oldParent = draggedEl.parentElement;
        dndTray.appendChild(draggedEl);
        if (oldParent && oldParent.classList.contains('drop-zone')) {
            oldParent.classList.add('empty');
        }
    }
}

function verifyDND(correctOrderString, explanation, btnRef, rawText) {
    const zones = document.querySelectorAll('.drop-zone');
    let userOrder = [];

    zones.forEach(zone => {
        if (zone.children.length > 0) {
            userOrder.push(zone.children[0].dataset.label);
            zone.children[0].draggable = false;
        } else {
            userOrder.push("BLANK");
        }
    });

    btnRef.classList.add('hidden');

    const cleanUser = userOrder.join(',').replace(/\s/g, '').toUpperCase();
    const cleanCorrect = (correctOrderString || "").replace(/\s/g, '').toUpperCase();

    const q = quizQuestions[currentQIndex];
    const optionsMap = { 'A': q.optionA, 'B': q.optionB, 'C': q.optionC, 'D': q.optionD };

    let standardizedText = rawText
        .split("[blank]").join("###")
        .split("[]").join("###")
        .split("[ ]").join("###")
        .split("<blank>").join("###")
        .split("___").join("###");

    let textParts = standardizedText.split("###");
    let correctStatement = textParts[0];
    const correctArr = cleanCorrect.split(',');

    let replaceIdx = 0;
    for (let i = 1; i < textParts.length; i++) {
        if (replaceIdx < correctArr.length) {
            const key = correctArr[replaceIdx];
            const word = optionsMap[key] || key;
            replaceIdx++;
            correctStatement += ` <strong>[ ${word} ]</strong> `;
        } else {
            correctStatement += ' [ ___ ] ';
        }
        correctStatement += textParts[i];
    }

    let finalExplanation = explanation || "No additional explanation provided.";

    if (cleanUser === cleanCorrect) {
        score++;
        document.getElementById("question-text").style.color = "#155724";
        zones.forEach(zone => {
            zone.style.backgroundColor = "#28a745";
            zone.style.borderColor = "#28a745";
            zone.style.color = "white";
        });
        showExplanation(`Correct!\n\n${finalExplanation}`);
    } else {
        document.getElementById("question-text").style.color = "#c0392b";
        zones.forEach(zone => {
            if (zone.children.length > 0) {
                zone.style.backgroundColor = "#c0392b";
                zone.style.borderColor = "#c0392b";
                zone.style.color = "white";
            } else {
                zone.style.borderColor = "#c0392b";
                zone.style.backgroundColor = "#fdeeed";
            }
        });
        showExplanation(`Correct Statement:\n${correctStatement}\n\nExplanation:\n${finalExplanation}`);
    }
}

// MULTIPLE CHOICE ENGINE
function verifyMCQ(correctString, explanation, btnRef) {
    const inputs = document.querySelectorAll('.opt-input');
    let userAnswers = [];

    inputs.forEach(input => {
        input.disabled = true;
        if (input.checked) userAnswers.push(input.value);
    });

    if (userAnswers.length === 0) {
        alert("Please select an answer.");
        inputs.forEach(i => i.disabled = false);
        return;
    }

    btnRef.classList.add('hidden');
    const cleanUser = userAnswers.sort().join(',');
    const correctArr = correctString.split(',').sort().join(',');

    inputs.forEach(input => {
        const parent = input.parentElement;
        if (correctString.includes(input.value)) {
            parent.classList.add('correct');
        } else if (input.checked && !correctString.includes(input.value)) {
            parent.classList.add('incorrect');
        }
    });

    if (cleanUser === correctArr) score++;

    showExplanation(explanation);
}

function showExplanation(text) {
    document.getElementById("explanation-text").innerText = text || "No explanation provided.";
    document.getElementById("explanation-box").classList.remove("hidden");
    document.getElementById("next-q-btn").classList.remove("hidden");
    triggerAnimation('explanation-box');
}

function nextQuestion() {
    currentQIndex++;
    if (currentQIndex < quizQuestions.length) { renderQuestion(); }
    else { finishQuiz(false); }
}

async function finishQuiz(isTimeout) {
    clearInterval(timerInterval);
    document.getElementById("student-quiz-card").classList.add("hidden");
    document.getElementById("student-result-card").classList.remove("hidden");

    const finalMarks = Math.round((score / quizQuestions.length) * 100);
    document.getElementById("final-score").innerText = finalMarks;

    const resultPayload = {
        quizId: currentAssessmentId, studentId: 1, mark: finalMarks,
        totalQuestions: quizQuestions.length, correctCount: score
    };

    try {
        await fetch(`${BASE_URL}/student/submit-score`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resultPayload)
        });
        await viewProgress();
    } catch(err) {
        console.error("Score Submit Error:", err);
    }
}

async function viewProgress() {
    document.getElementById("progress-card").classList.remove("hidden");
    try {
        const response = await fetch(`${BASE_URL}/student/1/progress`);
        const results = await response.json();
        const scatterData = results.map((result) => ({ x: result.quizId, y: result.mark }));
        drawChart(scatterData);
    } catch (error) {
        console.error("Progress Fetch Error:", error);
    }
}

function drawChart(dataPoints) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    if (progressChartInstance) progressChartInstance.destroy();
    progressChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: [{ label: 'Student Marks per Quiz', data: dataPoints, backgroundColor: 'rgba(31, 78, 121, 1)', pointRadius: 8 }] },
        options: { scales: { x: { title: { display: true, text: 'Quiz ID' }, min: 1, ticks: { stepSize: 1 } }, y: { title: { display: true, text: 'Marks (out of 100)' }, min: 0, max: 100 } } }
    });
}

// ADMIN DASHBOARD
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
