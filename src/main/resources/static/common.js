// Spring Boot serves these pages and the API on the same origin.
const BASE_URL = "/api/quiz";

function triggerAnimation(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('fade-in-up');
    void el.offsetWidth;
    el.classList.add('fade-in-up');
}

function switchView(view) {
    const routes = {
        student: "/student/student.html",
        admin: "/admin/admin.html",
        tutor: "/tutor/tutor.html"
    };
    if (routes[view] && document.body.dataset.view !== view) {
        window.location.assign(routes[view]);
    }
}
