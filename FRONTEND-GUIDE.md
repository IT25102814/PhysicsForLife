# Frontend separated by role

All frontend files are in `src/main/resources/static/`.

| Folder | Files | Responsibility |
| --- | --- | --- |
| student | student.html, student.js, student.css | Student dashboard, quiz, single/multiple choice, true/false, drag-and-drop, timer, score submission and progress |
| admin | admin.html, admin.js | Admin login, password change, quiz settings, adding and deleting questions |
| tutor | tutor.html, tutor.js | Tutor login and class analytics |
| shared | common.css, common.js, charts.js | Common design, API URL, navigation, animations and chart rendering |

`index.html` opens the student page. Shared forms/cards use common.css; role-specific inline styles remain beside their HTML. Student-only welcome and answer styles are in student.css. Each page loads only its own role script, plus the shared files it needs.

## Run in IntelliJ

1. Extract the ZIP and open `ooad/physicsforlife` as a Maven project in IntelliJ IDEA.
2. Keep your working MySQL settings in `src/main/resources/application.properties`.
3. Start the Spring Boot application (or run `./mvnw spring-boot:run`; Windows: `mvnw.cmd spring-boot:run`).
4. Open http://localhost:8081/ in your browser.

Direct pages:
- Student: http://localhost:8081/student/student.html
- Admin: http://localhost:8081/admin/admin.html
- Tutor: http://localhost:8081/tutor/tutor.html

Open through Spring Boot, not by double-clicking HTML files. BASE_URL now uses `/api/quiz`, so the API follows the server's host and port.

## Behaviour and existing limitations

Navigation now opens separate pages. Switching roles or refreshing resets unsaved frontend state; finish an assessment before leaving its page. Admin and tutor logins reset on page reload.

Backend files and API payloads are unchanged. This is a frontend organization change, not new role authorization. The existing backend has no tutor login endpoint; tutor.js retains the original demo login fallback (tutor / 1234, also admin / 1234). Tutor analytics retain the original simulated values and fallback chart; they are not verified class performance. Student requests still use student ID 1. These inherited behaviours need separate backend work for a production system.

## Validation

JavaScript syntax checks passed. Static checks passed for all three pages: local asset paths, unique element IDs, role isolation, inline event-handler functions and JavaScript DOM references. All original non-frontend files were compared byte-for-byte and are unchanged. Browser interaction tests could not run because a browser executable is unavailable in the validation environment. A live MySQL/Spring Boot integration run was not performed.
