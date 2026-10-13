
const API_BASE = "http://localhost:8080/api";

let studentInstitutes = [];
let studentCurricula = [];
let studentBatches = [];
let studentMaterials = [];
let selectedStudentBatchId = null;


// =====================================
// INITIALIZE STUDENT DASHBOARD
// =====================================

document.addEventListener("DOMContentLoaded", function () {
    loadStudentCourses();
});


// =====================================
// LOAD INSTITUTES, CURRICULA AND BATCHES
// =====================================

async function loadStudentCourses() {
    const message = document.getElementById("studentCourseMessage");

    try {
        const [institutesResponse, curriculaResponse, batchesResponse] =
            await Promise.all([
                fetch(`${API_BASE}/institutes`),
                fetch(`${API_BASE}/curricula`),
                fetch(`${API_BASE}/batches`)
            ]);

        if (!institutesResponse.ok ||
            !curriculaResponse.ok ||
            !batchesResponse.ok) {
            throw new Error("Unable to load course information.");
        }

        studentInstitutes = await institutesResponse.json();
        studentCurricula = await curriculaResponse.json();
        studentBatches = await batchesResponse.json();

        populateStudentInstitutes();
        populateStudentCurricula();
        populateStudentBatches();

        document.getElementById("studentInstitute")
            .addEventListener("change", populateStudentBatches);

        document.getElementById("studentCurriculum")
            .addEventListener("change", populateStudentBatches);

        if (message) {
            message.textContent = "Course information loaded successfully.";
        }

    } catch (error) {
        console.error("Error loading student courses:", error);

        if (message) {
            message.textContent =
                "Unable to load courses. Please ensure the backend is running.";
        }
    }
}


// =====================================
// POPULATE DROPDOWNS
// =====================================

function populateStudentInstitutes() {
    const select = document.getElementById("studentInstitute");

    select.innerHTML = '<option value="">Select an institute</option>';

    studentInstitutes.forEach(institute => {
        const option = document.createElement("option");

        option.value = institute.instituteId;
        option.textContent = institute.name;

        select.appendChild(option);
    });
}


function populateStudentCurricula() {
    const select = document.getElementById("studentCurriculum");

    select.innerHTML = '<option value="">Select a curriculum</option>';

    studentCurricula.forEach(curriculum => {
        const option = document.createElement("option");

        option.value = curriculum.curriculumId;
        option.textContent = curriculum.name;

        select.appendChild(option);
    });
}


function populateStudentBatches() {
    const instituteId =
        document.getElementById("studentInstitute").value;

    const curriculumId =
        document.getElementById("studentCurriculum").value;

    const select = document.getElementById("studentBatch");

    select.innerHTML = '<option value="">Select a batch</option>';

    // Reset the selected course whenever the filters change.
    selectedStudentBatchId = null;

    const filteredBatches = studentBatches.filter(batch => {
        const matchesInstitute =
            !instituteId ||
            String(batch.institute?.instituteId) === instituteId;

        const matchesCurriculum =
            !curriculumId ||
            String(batch.curriculum?.curriculumId) === curriculumId;

        const isActive =
            batch.isActive === undefined || batch.isActive === true;

        return matchesInstitute && matchesCurriculum && isActive;
    });

    filteredBatches.forEach(batch => {
        const option = document.createElement("option");

        option.value = batch.batchId;
        option.textContent = batch.batchName;

        select.appendChild(option);
    });
}


// =====================================
// SIDEBAR NAVIGATION
// =====================================

function setStudentActiveNavigation(activeId) {
    document.querySelectorAll(".sidebar-item").forEach(button => {
        button.classList.remove("active");
    });

    const activeButton = document.getElementById(activeId);

    if (activeButton) {
        activeButton.classList.add("active");
    }
}


function showStudentDashboard() {
    document.getElementById("student-dashboard-view").style.display = "block";
    document.getElementById("student-content").style.display = "none";

    setStudentActiveNavigation("dashboardNav");
}


function showStudentCourses() {
    document.getElementById("student-dashboard-view").style.display = "none";

    const content = document.getElementById("student-content");
    content.style.display = "block";

    setStudentActiveNavigation("coursesNav");

    content.innerHTML = `
        <button type="button"
                class="student-secondary-button"
                onclick="showStudentDashboard()">
            ← Back to Dashboard
        </button>

        <div class="section-heading">
            <div>
                <span>STUDENT LEARNING</span>
                <h2>My Courses</h2>
            </div>
        </div>

        <div class="student-course-list">
            ${renderStudentCourseCards()}
        </div>
    `;
}


// =====================================
// VIEW COURSE CONTENT BUTTON
// =====================================

function openSelectedStudentCourse() {
    const instituteSelect = document.getElementById("studentInstitute");
    const curriculumSelect = document.getElementById("studentCurriculum");
    const batchSelect = document.getElementById("studentBatch");
    const message = document.getElementById("studentCourseMessage");

    if (!instituteSelect.value ||
        !curriculumSelect.value ||
        !batchSelect.value) {

        message.textContent =
            "Please select an institute, curriculum, and batch.";

        return;
    }

    selectedStudentBatchId = Number(batchSelect.value);

    message.textContent = "";

    // Navigate to My Courses.
    showStudentCourses();
}


// =====================================
// DISPLAY ONLY THE SELECTED COURSE
// =====================================

function renderStudentCourseCards() {
    if (selectedStudentBatchId === null) {
        return `
            <div class="student-feature-card">
                <div class="student-feature-icon">📚</div>

                <h3>No Course Selected</h3>

                <p>
                    Please select your institute, curriculum, and batch
                    from the Dashboard.
                </p>

                <button type="button"
                        class="student-primary-button"
                        onclick="showStudentDashboard()">
                    Select My Course →
                </button>
            </div>
        `;
    }

    const batch = studentBatches.find(
        item => Number(item.batchId) === selectedStudentBatchId
    );

    if (!batch) {
        return `
            <p>The selected course could not be found.</p>

            <button type="button"
                    class="student-primary-button"
                    onclick="showStudentDashboard()">
                Select Another Course →
            </button>
        `;
    }

    return `
        <div class="student-feature-card">
            <div class="student-feature-icon">📚</div>

            <h3>${escapeStudentHTML(batch.batchName || "My Course")}</h3>

            <p>
                <strong>Institute:</strong>
                ${escapeStudentHTML(batch.institute?.name || "Unknown")}
            </p>

            <p>
                <strong>Curriculum:</strong>
                ${escapeStudentHTML(batch.curriculum?.name || "Unknown")}
            </p>

            <button type="button"
                    class="student-primary-button"
                    onclick="openStudentBatch(${Number(batch.batchId)})">
                View Course Content →
            </button>
        </div>
    `;
}


// =====================================
// OPEN SELECTED BATCH MATERIALS
// =====================================

async function openStudentBatch(batchId) {
    selectedStudentBatchId = Number(batchId);

    document.getElementById("student-dashboard-view").style.display = "none";

    const content = document.getElementById("student-content");

    content.style.display = "block";
    content.innerHTML = "<p>Loading course materials...</p>";

    setStudentActiveNavigation("coursesNav");

    try {
        const response = await fetch(`${API_BASE}/learning-materials`);

        if (!response.ok) {
            throw new Error("Unable to load learning materials.");
        }

        studentMaterials = await response.json();

        const batch = studentBatches.find(
            item => Number(item.batchId) === selectedStudentBatchId
        );

        const materials = studentMaterials.filter(
            material =>
                Number(material.batch?.batchId) === selectedStudentBatchId
        );

        renderStudentBatchMaterials(batch, materials);

    } catch (error) {
        console.error("Error loading learning materials:", error);

        content.innerHTML = `
            <button type="button"
                    class="student-secondary-button"
                    onclick="showStudentCourses()">
                ← Back to My Courses
            </button>

            <p>
                Unable to load learning materials.
                Please check the backend and try again.
            </p>
        `;
    }
}


// =====================================
// GROUP MATERIALS BY WEEK
// =====================================

function renderStudentBatchMaterials(batch, materials) {
    const content = document.getElementById("student-content");

    const batchName = batch?.batchName || "Selected Course";
    const instituteName = batch?.institute?.name || "Unknown";
    const curriculumName = batch?.curriculum?.name || "Unknown";

    const groupedMaterials = {};

    materials.forEach(material => {
        const week = material.weekNumber ?? "Other";

        if (!groupedMaterials[week]) {
            groupedMaterials[week] = [];
        }

        groupedMaterials[week].push(material);
    });

    const sortedWeeks = Object.keys(groupedMaterials).sort((a, b) => {
        if (a === "Other") return 1;
        if (b === "Other") return -1;

        return Number(a) - Number(b);
    });

    let materialsHTML = "";

    if (materials.length === 0) {
        materialsHTML = `
            <div class="student-feature-card">
                <h3>No Materials Yet</h3>
                <p>
                    No learning materials have been uploaded for this
                    course yet. Please check again later.
                </p>
            </div>
        `;
    } else {
        sortedWeeks.forEach(week => {
            const heading = week === "Other"
                ? "Other Materials"
                : `Week ${escapeStudentHTML(week)}`;

            materialsHTML += `
                <div class="student-week-section">
                    <h3>${heading}</h3>

                    <div class="student-material-list">
                        ${groupedMaterials[week].map(material => `
                            <div class="student-material-card">

                                <div class="student-feature-icon">
                                    ${getStudentMaterialIcon(material.materialType)}
                                </div>

                                <div class="student-material-details">
                                    <h4>
                                        ${escapeStudentHTML(material.title || "Untitled Material")}
                                    </h4>

                                    <p>
                                        ${escapeStudentHTML(material.materialType || "Resource")}
                                    </p>

                                    <p>
                                        ${escapeStudentHTML(material.description || "")}
                                    </p>

                                    ${getStudentMaterialLink(material)}
                                </div>

                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        });
    }

    content.innerHTML = `
        <button type="button"
                class="student-secondary-button"
                onclick="showStudentCourses()">
            ← Back to My Courses
        </button>

        <div class="section-heading">
            <div>
                <span>COURSE CONTENT</span>
                <h2>${escapeStudentHTML(batchName)}</h2>
            </div>
        </div>

        <div class="student-course-info">
            <p>
                <strong>Institute:</strong>
                ${escapeStudentHTML(instituteName)}
            </p>

            <p>
                <strong>Curriculum:</strong>
                ${escapeStudentHTML(curriculumName)}
            </p>

            <p>
                <strong>Total Materials:</strong> ${materials.length}
            </p>
        </div>

        ${materialsHTML}
    `;
}


// =====================================
// MATERIAL LINKS
// =====================================

function getStudentMaterialLink(material) {
    if (!material.filePath) {
        return "<p>No file or link available.</p>";
    }

    const filePath = String(material.filePath);

    // External resources, such as YouTube.
    if (/^https?:\/\//i.test(filePath)) {
        return `
            <a class="student-material-link"
               href="${escapeStudentHTML(filePath)}"
               target="_blank"
               rel="noopener noreferrer">
                Open Learning Material ↗
            </a>
        `;
    }

    // Uploaded files served by the Spring Boot backend.
    if (material.materialId != null && material.fileName) {
        return `
            <a class="student-material-link"
               href="${API_BASE}/learning-materials/files/${Number(material.materialId)}"
               target="_blank"
               rel="noopener noreferrer">
                Open / Download ${escapeStudentHTML(material.fileName)} ↗
            </a>
        `;
    }

    return "<p>Material link is unavailable.</p>";
}


function getStudentMaterialIcon(type) {
    switch (String(type || "").toUpperCase()) {
        case "PDF":
            return "📄";

        case "VIDEO":
            return "🎥";

        case "DOCUMENT":
            return "📝";

        default:
            return "📚";
    }
}


// =====================================
// SAFE HTML HELPER
// =====================================

function escapeStudentHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}
