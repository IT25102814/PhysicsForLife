// Student quiz page. The student is the person who logged in to the main portal.
const CURRENT_STUDENT_ID = Number(localStorage.getItem("userId"));

// Student assessment, answers, timer, results and progress.
let quizQuestions = [];
let currentQIndex = 0;
let score = 0;
let timeRemaining = 0;
let timerInterval = null;
let currentAssessmentId = 1;

async function startStudentQuiz() {
    try {
        const response = await fetch(`${BASE_URL}/student/data`);
        const data = await response.json();

        quizQuestions = data.questions;
        if (!quizQuestions || quizQuestions.length === 0) {
            showToast("No questions are available yet.", false);
            return;
        }

        const progressRes = await fetch(`${BASE_URL}/student/${CURRENT_STUDENT_ID}/progress`);
        const progressData = await progressRes.json();

        if (Array.isArray(progressData) && progressData.some(result => result.quizId === data.quizId)) {
            showToast("You have already completed this assessment. You cannot attempt a quiz twice.", false);
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
        showToast("Failed to load the quiz. Check that the server is running.", false);
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
    document.getElementById("question-text").style.color = "var(--navy)";

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
        if (rawText.includes("[blank]") || rawText.includes("[]") || rawText.includes("[ ]") || rawText.includes("___") || rawText.includes("<blank>")) {
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
            zone.style.backgroundColor = "#d4edda";
            zone.style.borderColor = "#28a745";
            zone.style.color = "var(--text)";
        });
        showExplanation(`Correct!\n\n${finalExplanation}`);
    } else {
        document.getElementById("question-text").style.color = "#c0392b";
        zones.forEach(zone => {
            if (zone.children.length > 0) {
                zone.style.backgroundColor = "#f8d7da";
                zone.style.borderColor = "#dc3545";
                zone.style.color = "var(--text)";
            } else {
                zone.style.borderColor = "#dc3545";
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
        showToast("Please select an answer.", false);
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
        quizId: currentAssessmentId, studentId: CURRENT_STUDENT_ID, mark: finalMarks,
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
        const response = await fetch(`${BASE_URL}/student/${CURRENT_STUDENT_ID}/progress`);
        const results = await response.json();
        const scatterData = results.map((result) => ({ x: result.quizId, y: result.mark }));
        drawChart(scatterData, 'progressChart', 'scatter');
    } catch (error) {
        console.error("Progress Fetch Error:", error);
    }
}
