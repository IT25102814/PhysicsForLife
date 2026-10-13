// Shared helpers for the quiz pages. Uses the main portal login (localStorage).
const BASE_URL = "/api/quiz";

function getLoggedInUser() {
    return {
        id: Number(localStorage.getItem('userId')),
        name: localStorage.getItem('userName') || '',
        role: (localStorage.getItem('userRole') || '').toUpperCase()
    };
}

// Call at the top of each page: allowedRoles = ['STUDENT'] or ['TUTOR','ADMIN']
function requireRole(allowedRoles) {
    const u = getLoggedInUser();
    if (!u.id || !allowedRoles.includes(u.role)) {
        window.location.href = '/login.html';
        return null;
    }
    return u;
}

function backToDashboard() {
    const role = getLoggedInUser().role;
    if (role === 'ADMIN') window.location.href = '/admin-dashboard.html';
    else if (role === 'TUTOR') window.location.href = '/tutor-dashboard.html';
    else window.location.href = '/dashboard.html';
}

function logoutQuiz() {
    localStorage.clear();
    window.location.href = '/login.html';
}

function triggerAnimation(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('fade-in-up');
    void el.offsetWidth;
    el.classList.add('fade-in-up');
}

// Green (success) / red (error) message that fades away by itself - replaces alert() pop-ups.
function showToast(message, isSuccess = true) {
    let box = document.getElementById('toast-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'toast-box';
        document.body.appendChild(box);
    }
    const toast = document.createElement('div');
    toast.className = 'toast ' + (isSuccess ? 'toast-success' : 'toast-error');
    toast.textContent = (isSuccess ? '✔ ' : '✖ ') + message;
    box.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}
