const BASE_URL = "http://localhost:8081/api/quiz";

let quizQuestions = [];
let currentQIndex = 0;
let score = 0;
let timeRemaining = 0;
let timerInterval = null;
let progressChartInstance = null;
let currentAssessmentId = 1;

let adminQuizConfig = { quizId: 1, title: "Physics Assessment", timeLimitMinutes: 10, maxQuestions: 10 };

function switchView(view) {
    document.getElementById("btn-student-view").classList.toggle("active", view === 'student');
    document.getElementById("btn-admin-view").classList.toggle("active", view === 'admin');
    document.getElementById("student-section").classList.toggle("hidden", view !== 'student');
    document.getElementById("admin-section").classList.toggle("hidden", view !== 'admin');
}

async function loginAdmin() {
    const password = document.getElementById("admin-pass-input").value;
    const errBox = document.getElementById("admin-error");
    try {
        const res = await fetch(`${BASE_URL}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: password })
        });
        if (res.ok) {
            errBox.classList.add("hidden");
            document.getElementById("admin-login-card").classList.add("hidden");
            document.getElementById("admin-dashboard").classList.remove("hidden");
        } else {
            errBox.innerText = "Incorrect Admin Password!";
            errBox.classList.remove("hidden");
        }
    } catch (error) {
        errBox.innerText = "Server offline. Is Spring Boot running?";
        errBox.classList.remove("hidden");
    }
}

function logoutAdmin() {
    document.getElementById("admin-pass-input").value = "";
    document.getElementById("admin-dashboard").classList.add("hidden");
    document.getElementById("admin-login-card").classList.remove("hidden");
}

// THIS FUNCTION HANDLES THE PASSWORD UPDATE
async function changeAdminPassword() {
    const oldPassword = document.getElementById("old-pass").value;
    const newPassword = document.getElementById("new-pass").value;

    if (!oldPassword || !newPassword) {
        alert("Please enter both your current and new passwords.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/admin/change-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword })
        });
        const msg = await res.text();
        alert(msg);

        if (res.ok) {
            document.getElementById("old-pass").value = "";
            document.getElementById("new-pass").value = "";
        }
    } catch (error) {
        alert("Failed to connect to the backend server.");
    }
}

async function saveFullQuizConfig() {
    adminQuizConfig.quizId = parseInt(document.getElementById("quiz-id-input").value) || 1;
    adminQuizConfig.title = document.getElementById("title-input").value || "New Quiz";
    adminQuizConfig.timeLimitMinutes = parseInt(document.getElementById("time-input").value) || 10;
    adminQuizConfig.maxQuestions = parseInt(document.getElementById("count-input").value) || 10;

    const res = await fetch(`${BASE_URL}/admin/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminQuizConfig)
    });
    const msg = await res.text();
    alert(msg);
}

async function addQuestion() {
    const questionText = document.getElementById("q-input").value;
    const optionA = document.getElementById("opt-a").value;
    const optionB = document.getElementById("opt-b").value;
    const optionC = document.getElementById("opt-c").value;
    const optionD = document.getElementById("opt-d").value;
    const correctOption = document.getElementById("correct-opt").value;
    const explanation = document.getElementById("q-explanation").value;

    if (!questionText || !optionA || !optionB) {
        alert("Please fill the question and at least options A and B!");
        return;
    }

    const payload = {
        questionText: questionText, optionA: optionA, optionB: optionB,
        optionC: optionC, optionD: optionD, correctOption: correctOption, explanation: explanation
    };

    const res = await fetch(`${BASE_URL}/admin/add-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    const msg = await res.text();
    alert(msg);

    if (res.ok) { clearQuestionForm(); }
}

function clearQuestionForm() {
    document.getElementById("q-input").value = "";
    document.getElementById("opt-a").value = "";
    document.getElementById("opt-b").value = "";
    document.getElementById("opt-c").value = "";
    document.getElementById("opt-d").value = "";
    document.getElementById("q-explanation").value = "";
}

async function clearAllQuestions() {
    if (!confirm("Are you sure you want to delete ALL questions for this quiz?")) return;
    try {
        const res = await fetch(`${BASE_URL}/admin/clear-questions`, { method: "POST" });
        const msg = await res.text();
        alert(msg);
        clearQuestionForm();
    } catch (error) {
        alert("Failed to connect to backend.");
    }
}

// Student Functions
async function startStudentQuiz() {
    try {
        const response = await fetch(`${BASE_URL}/student/data`);
        const data = await response.json();
        quizQuestions = data.questions;
        if (!quizQuestions || quizQuestions.length === 0) {
            alert("No questions available in the database!");
            return;
        }
        currentAssessmentId = data.quizId;
        timeRemaining = (data.timeLimitMinutes || 5) * 60;
        currentQIndex = 0;
        score = 0;
        document.getElementById("display-quiz-title").innerText = data.title;
        document.getElementById("student-start-card").classList.add("hidden");
        document.getElementById("student-quiz-card").classList.remove("hidden");
        startTimer();
        renderQuestion();
    } catch (err) {
        alert("Failed to fetch records.");
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
    const q = quizQuestions[currentQIndex];
    document.getElementById("q-counter").innerText = `Question ${currentQIndex + 1} of ${quizQuestions.length}`;
    document.getElementById("question-text").innerText = q.questionText;
    const optContainer = document.getElementById("options-list");
    optContainer.innerHTML = "";
    const optionsArray = [
        { label: 'A', text: q.optionA }, { label: 'B', text: q.optionB },
        { label: 'C', text: q.optionC }, { label: 'D', text: q.optionD }
    ];
    optionsArray.forEach((opt) => {
        if(opt.text) {
            const btn = document.createElement("button");
            btn.classList.add("opt-btn");
            btn.innerText = `${opt.label}. ${opt.text}`;
            btn.onclick = () => selectAnswer(btn, opt.label, q.correctOption, q.explanation, optionsArray);
            optContainer.appendChild(btn);
        }
    });
}

function selectAnswer(selectedBtn, selectedLabel, correctLabel, explanation, optionsArray) {
    const allBtns = document.querySelectorAll(".opt-btn");
    allBtns.forEach(b => b.disabled = true);
    if (selectedLabel === correctLabel) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
        const correctIndex = optionsArray.findIndex(o => o.label === correctLabel);
        if(allBtns[correctIndex]) allBtns[correctIndex].classList.add("correct");
    }
    document.getElementById("explanation-text").innerText = explanation || "No explanation provided.";
    document.getElementById("explanation-box").classList.remove("hidden");
    document.getElementById("next-q-btn").classList.remove("hidden");
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
    await fetch(`${BASE_URL}/student/submit-score`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultPayload)
    });
    await viewProgress();
}

async function viewProgress() {
    document.getElementById("progress-card").classList.remove("hidden");
    try {
        const response = await fetch(`${BASE_URL}/student/1/progress`);
        const results = await response.json();
        if (!results || results.length === 0) return;
        const scatterData = results.map((result) => ({ x: result.quizId, y: result.mark }));
        drawChart(scatterData);
    } catch (error) { console.error("Error fetching progress:", error); }
}

function drawChart(dataPoints) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    if (progressChartInstance) progressChartInstance.destroy();
    progressChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: [{ label: 'Student Marks per Quiz', data: dataPoints, backgroundColor: 'rgba(139, 75, 189, 1)', pointRadius: 8 }] },
        options: { scales: { x: { title: { display: true, text: 'Quiz ID' }, min: 1, ticks: { stepSize: 1 } }, y: { title: { display: true, text: 'Marks (out of 100)' }, min: 0, max: 100 } } }
    });
}