/* =========================================
   PHYSICS FOR LIFE - UNIFIED APPLICATION SCRIPT
   Port 8081 & Member 1 / Member 2 Integrated
========================================= */

// 1. REGISTRATION LOGIC
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const userData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            passwordHash: document.getElementById('passwordHash').value
        };

        const submitBtn = registrationForm.querySelector('button[type="submit"]');
        const messageElement = document.getElementById('message');

        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Registering...';
        messageElement.style.display = 'none';

        fetch('http://localhost:8081/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Registration failed. Email might already exist.');
            })
            .then(() => {
                messageElement.className = 'alert-banner alert-success';
                messageElement.textContent = 'Registration Successful! Redirecting to sign in...';
                messageElement.style.display = 'block';
                registrationForm.reset();
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            })
            .catch(error => {
                messageElement.className = 'alert-banner alert-error';
                messageElement.textContent = error.message;
                messageElement.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Register';
            });
    });
}

// 2. LOGIN LOGIC
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const loginData = {
            email: document.getElementById('loginEmail').value,
            passwordHash: document.getElementById('loginPassword').value
        };

        const loginBtn = document.getElementById('loginBtn');
        const messageElement = document.getElementById('loginMessage');

        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Verifying...';
        messageElement.style.display = 'none';

        fetch('http://localhost:8081/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
            .then(async response => {
                if (response.ok) return response.json();
                const errorText = await response.text();
                let errorMessage = 'Invalid email or password.';
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    if (errorText) errorMessage = errorText;
                }
                throw new Error(errorMessage);
            })
            .then(user => {
                messageElement.className = 'alert-banner alert-success';
                messageElement.textContent = 'Login Successful! Redirecting...';
                messageElement.style.display = 'block';

                localStorage.setItem('userId', user.userId);
                localStorage.setItem('userName', user.fullName);
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userRole', user.role);

                setTimeout(() => {
                    if (user.role === 'ADMIN') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (user.role === 'TUTOR') {
                        window.location.href = 'tutor-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
            })
            .catch(error => {
                messageElement.className = 'alert-banner alert-error';
                messageElement.textContent = error.message;
                messageElement.style.display = 'block';
                loginBtn.disabled = false;
                loginBtn.innerHTML = 'Login';
            });
    });
}

// 3. LOGOUT LOGIC
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

// 4. ADMIN USER MANAGEMENT & EDITING
async function fetchUsersForAdmin() {
    const adminUserTableBody = document.getElementById('adminUserTableBody');
    if (!adminUserTableBody) return;

    try {
        const response = await fetch('http://localhost:8081/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();

        adminUserTableBody.innerHTML = '';
        users.forEach(user => {
            adminUserTableBody.innerHTML += `
                <tr>
                    <td style="padding: 10px;">${user.userId}</td>
                    <td style="padding: 10px;">${escapeHtml(user.fullName)}</td>
                    <td style="padding: 10px;">${escapeHtml(user.email)}</td>
                    <td style="padding: 10px;">${escapeHtml(user.role)}</td>
                    <td style="padding: 10px;"><strong>${escapeHtml(user.accountStatus)}</strong></td>
                    <td style="padding: 10px;">
                        <button onclick="showAdminEditUserForm(${user.userId}, '${escapeHtml(user.fullName)}', '${escapeHtml(user.email)}', '${escapeHtml(user.phone || '')}', '${escapeHtml(user.role)}')" 
                                style="padding: 5px 10px; font-size: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                            Edit
                        </button>
                        <button onclick="toggleUserStatus(${user.userId}, '${user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'}')" 
                                style="padding: 5px 10px; font-size: 12px; background: ${user.accountStatus === 'ACTIVE' ? '#ffc107' : '#28a745'}; color: black; border: none; border-radius: 4px; cursor: pointer;">
                            ${user.accountStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error('Error loading admin user table:', err);
    }
}

function showAdminEditUserForm(userId, name, email, phone, role) {
    const dashView = document.getElementById("dashboard-view");
    const content = document.getElementById("content");
    const usersTab = document.getElementById("usersTab");

    if (dashView) dashView.style.display = "none";
    if (usersTab) usersTab.style.display = "none";
    if (content) content.style.display = "block";

    content.innerHTML = `
        <button class="dashboard-button" onclick="showUserManagement()">← Back to Users</button>
        <h2>Edit User Profile (Admin)</h2>
        <div class="form-card" style="background:#fff; padding:20px; border-radius:8px; margin-top:15px;">
            <div id="formMessage" class="alert-banner" style="display:none;"></div>
            <label>Full Name</label>
            <input type="text" id="adminEditName" value="${name}" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
            <label>Email</label>
            <input type="email" id="adminEditEmail" value="${email}" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
            <label>Phone</label>
            <input type="text" id="adminEditPhone" value="${phone}" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
            <label>Role</label>
            <select id="adminEditRole" style="width:100%; padding:8px; margin-top:5px; margin-bottom:15px;">
                <option value="STUDENT" ${role === 'STUDENT' ? 'selected' : ''}>STUDENT</option>
                <option value="TUTOR" ${role === 'TUTOR' ? 'selected' : ''}>TUTOR</option>
                <option value="ADMIN" ${role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
            </select>
            <button class="dashboard-button" onclick="submitAdminEditUser(${userId})">Save User Changes</button>
        </div>
    `;
}

async function submitAdminEditUser(userId) {
    const fullName = document.getElementById("adminEditName").value.trim();
    const email = document.getElementById("adminEditEmail").value.trim();
    const phone = document.getElementById("adminEditPhone").value.trim();
    const role = document.getElementById("adminEditRole").value;
    const msg = document.getElementById("formMessage");

    try {
        const res = await fetch(`http://localhost:8081/api/users/admin/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, phone, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");

        msg.className = "alert-banner alert-success";
        msg.textContent = "User updated successfully!";
        msg.style.display = "block";
        setTimeout(() => { showUserManagement(); }, 1200);
    } catch (e) {
        msg.className = "alert-banner alert-error";
        msg.textContent = e.message || "Error updating user.";
        msg.style.display = "block";
    }
}

async function toggleUserStatus(userId, newStatus) {
    try {
        const response = await fetch(`http://localhost:8081/api/users/${userId}/status?status=${newStatus}`, {
            method: 'PUT'
        });
        if (response.ok) fetchUsersForAdmin();
    } catch (err) {
        console.error('Error updating status:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchUsersForAdmin();
});

// 5. NAVIGATION & MODULES
function navigateToSection(section, renderFunction) {
    const dashView = document.getElementById("dashboard-view");
    const content = document.getElementById("content");
    const usersTab = document.getElementById("usersTab");

    if (dashView) dashView.style.display = "none";
    if (usersTab) usersTab.style.display = "none";
    if (content) content.style.display = "block";

    document.querySelectorAll(".sidebar-item").forEach(button => {
        button.classList.toggle("active", button.dataset.section === section);
    });

    renderFunction();
}

function showDashboard() {
    const dashView = document.getElementById("dashboard-view");
    const content = document.getElementById("content");
    const usersTab = document.getElementById("usersTab");

    if (dashView) dashView.style.display = "block";
    if (content) content.style.display = "none";
    if (usersTab) usersTab.style.display = "none";

    document.querySelectorAll(".sidebar-item").forEach(button => {
        button.classList.toggle("active", button.dataset.section === "dashboard");
    });
}

function showUserManagement() {
    const dashView = document.getElementById("dashboard-view");
    const content = document.getElementById("content");
    const usersTab = document.getElementById("usersTab");

    if (dashView) dashView.style.display = "none";
    if (content) content.style.display = "none";
    if (usersTab) usersTab.style.display = "block";

    document.querySelectorAll(".sidebar-item").forEach(button => {
        button.classList.toggle("active", button.dataset.section === "users");
    });
    fetchUsersForAdmin();
}

// 6. INSTITUTES MODULE
async function showInstitutes() {
    const content = document.getElementById("content");
    content.innerHTML = "<p>Loading institutes...</p>";

    try {
        const response = await fetch("http://localhost:8081/api/management/institutes");
        if (!response.ok) throw new Error("Failed to load institutes");
        const institutes = await response.json();

        let html = `
            <button class="dashboard-button" onclick="showDashboard()">← Back to Dashboard</button>
            <h2>Institutes</h2>
            <button class="dashboard-button" onclick="showAddInstituteForm()" style="margin-left: 10px;">+ Add Institute</button>
            <div style="margin-top: 20px;">
        `;

        if (institutes.length === 0) {
            html += "<p>No institutes found.</p>";
        } else {
            institutes.forEach(institute => {
                html += `
                    <div class="institute-card" style="margin-bottom:15px; padding:15px; background:#fff; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                        <h3>${escapeHtml(institute.name)}</h3>
                        <p><strong>ID:</strong> ${institute.instituteId}</p>
                        <button class="dashboard-button" style="background:#ffc107; color:black; margin-right:5px; margin-top:10px;" onclick="showEditInstituteForm(${institute.instituteId}, '${escapeHtml(institute.name)}')">Edit</button>
                        <button class="dashboard-button" style="background:#dc3545; margin-top:10px;" onclick="deleteInstitute(${institute.instituteId})">Delete</button>
                    </div>
                `;
            });
        }
        html += "</div>";
        content.innerHTML = html;
    } catch (error) {
        console.error(error);
        content.innerHTML = "<p>Unable to load institutes.</p>";
    }
}

function showAddInstituteForm() {
    document.getElementById("content").innerHTML = `
        <button class="dashboard-button" onclick="showInstitutes()">← Back to Institutes</button>
        <h2>Add Institute</h2>
        <div class="form-card" style="background:#fff; padding:20px; border-radius:8px; margin-top:15px;">
            <div id="formMessage" class="alert-banner" style="display:none;"></div>
            <label for="instituteName">Institute Name</label>
            <input type="text" id="instituteName" placeholder="Enter institute name" style="width:100%; padding:8px; margin-top:5px; margin-bottom:15px;">
            <button class="dashboard-button" onclick="addInstitute()">Add Institute</button>
        </div>
    `;
}

async function addInstitute() {
    const name = document.getElementById("instituteName").value.trim();
    const msg = document.getElementById("formMessage");
    if (!name) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Please enter an institute name.";
        msg.style.display = "block";
        return;
    }

    try {
        const res = await fetch("http://localhost:8081/api/management/institutes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error("Failed");

        msg.className = "alert-banner alert-success";
        msg.textContent = "Institute added successfully!";
        msg.style.display = "block";
        setTimeout(() => { showInstitutes(); }, 1200);
    } catch (e) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Error adding institute.";
        msg.style.display = "block";
    }
}

function showEditInstituteForm(id, currentName) {
    document.getElementById("content").innerHTML = `
        <button class="dashboard-button" onclick="showInstitutes()">← Back to Institutes</button>
        <h2>Edit Institute</h2>
        <div class="form-card" style="background:#fff; padding:20px; border-radius:8px; margin-top:15px;">
            <div id="formMessage" class="alert-banner" style="display:none;"></div>
            <label for="editInstituteName">Institute Name</label>
            <input type="text" id="editInstituteName" value="${currentName}" style="width:100%; padding:8px; margin-top:5px; margin-bottom:15px;">
            <button class="dashboard-button" onclick="updateInstitute(${id})">Save Changes</button>
        </div>
    `;
}

async function updateInstitute(id) {
    const name = document.getElementById("editInstituteName").value.trim();
    const msg = document.getElementById("formMessage");
    if (!name) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Name cannot be empty.";
        msg.style.display = "block";
        return;
    }

    try {
        const res = await fetch(`http://localhost:8081/api/management/institutes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error("Update failed");

        msg.className = "alert-banner alert-success";
        msg.textContent = "Institute updated successfully!";
        msg.style.display = "block";
        setTimeout(() => { showInstitutes(); }, 1200);
    } catch (e) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Error updating institute.";
        msg.style.display = "block";
    }
}

async function deleteInstitute(id) {
    if (!confirm("Are you sure you want to delete this institute?")) return;
    try {
        await fetch(`http://localhost:8081/api/management/institutes/${id}`, { method: "DELETE" });
        showInstitutes();
    } catch (e) { console.error(e); }
}

// 7. CURRICULA MODULE
async function showCurricula() {
    const content = document.getElementById("content");
    content.innerHTML = "<p>Loading curricula...</p>";
    try {
        const res = await fetch("http://localhost:8081/api/management/curricula");
        const curricula = await res.json();
        let html = `
            <button class="dashboard-button" onclick="showDashboard()">← Back to Dashboard</button>
            <h2>Curricula</h2>
            <button class="dashboard-button" onclick="showAddCurriculumForm()" style="margin-left: 10px;">+ Add Curriculum</button>
            <div style="margin-top:20px;">
        `;
        curricula.forEach(c => {
            html += `
                <div class="curriculum-card" style="background:#fff; padding:15px; border-radius:6px; margin-bottom:10px;">
                    <h3>${escapeHtml(c.name)}</h3>
                    <button class="dashboard-button" style="background:#ffc107; color:black; margin-right:5px; margin-top:10px;" onclick="showEditCurriculumForm(${c.curriculumId}, '${escapeHtml(c.name)}')">Edit</button>
                    <button class="dashboard-button" style="background:#dc3545; margin-top:10px;" onclick="deleteCurriculum(${c.curriculumId})">Delete</button>
                </div>`;
        });
        html += "</div>";
        content.innerHTML = html;
    } catch (e) { content.innerHTML = "<p>Error loading curricula.</p>"; }
}

function showAddCurriculumForm() {
    document.getElementById("content").innerHTML = `
        <button class="dashboard-button" onclick="showCurricula()">← Back</button>
        <h2>Add Curriculum</h2>
        <div class="form-card" style="background:#fff; padding:20px; border-radius:8px; margin-top:15px;">
            <div id="formMessage" class="alert-banner" style="display:none;"></div>
            <label for="curriculumName">Curriculum Name</label>
            <input type="text" id="curriculumName" placeholder="Curriculum Name" style="width:100%; padding:8px; margin-top:5px; margin-bottom:15px;">
            <button class="dashboard-button" onclick="addCurriculum()">Save Curriculum</button>
        </div>
    `;
}

async function addCurriculum() {
    const name = document.getElementById("curriculumName").value.trim();
    const msg = document.getElementById("formMessage");
    if (!name) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Please enter a curriculum name.";
        msg.style.display = "block";
        return;
    }

    try {
        await fetch("http://localhost:8081/api/management/curricula", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });

        msg.className = "alert-banner alert-success";
        msg.textContent = "Curriculum added successfully!";
        msg.style.display = "block";
        setTimeout(() => { showCurricula(); }, 1200);
    } catch (e) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Error adding curriculum.";
        msg.style.display = "block";
    }
}

function showEditCurriculumForm(id, currentName) {
    document.getElementById("content").innerHTML = `
        <button class="dashboard-button" onclick="showCurricula()">← Back</button>
        <h2>Edit Curriculum</h2>
        <div class="form-card" style="background:#fff; padding:20px; border-radius:8px; margin-top:15px;">
            <div id="formMessage" class="alert-banner" style="display:none;"></div>
            <label for="editCurriculumName">Curriculum Name</label>
            <input type="text" id="editCurriculumName" value="${currentName}" style="width:100%; padding:8px; margin-top:5px; margin-bottom:15px;">
            <button class="dashboard-button" onclick="updateCurriculum(${id})">Save Changes</button>
        </div>
    `;
}

async function updateCurriculum(id) {
    const name = document.getElementById("editCurriculumName").value.trim();
    const msg = document.getElementById("formMessage");
    if (!name) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Name cannot be empty.";
        msg.style.display = "block";
        return;
    }

    try {
        const res = await fetch(`http://localhost:8081/api/management/curricula/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        if (!res.ok) throw new Error("Update failed");

        msg.className = "alert-banner alert-success";
        msg.textContent = "Curriculum updated successfully!";
        msg.style.display = "block";
        setTimeout(() => { showCurricula(); }, 1200);
    } catch (e) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Error updating curriculum.";
        msg.style.display = "block";
    }
}

async function deleteCurriculum(id) {
    if (!confirm("Are you sure?")) return;
    try {
        await fetch(`http://localhost:8081/api/management/curricula/${id}`, { method: "DELETE" });
        showCurricula();
    } catch (e) { console.error(e); }
}

// 8. BATCHES MODULE (WITH ADD & EDIT SUPPORT)
async function showBatches() {
    const content = document.getElementById("content");
    content.innerHTML = "<p>Loading batches...</p>";
    try {
        const res = await fetch("http://localhost:8081/api/management/batches");
        const batches = await res.json();
        let html = `
            <button class="dashboard-button" onclick="showDashboard()">← Back to Dashboard</button>
            <h2>Batches</h2>
            <button class="dashboard-button" onclick="showAddBatchForm()" style="margin-left: 10px;">+ Add Batch</button>
            <div style="margin-top:20px;">
        `;
        if (batches.length === 0) {
            html += "<p>No batches found.</p>";
        } else {
            batches.forEach(b => {
                html += `
                    <div class="batch-card" style="background:#fff; padding:15px; border-radius:6px; margin-bottom:10px;">
                        <h3>${escapeHtml(b.batchName)} (${b.batchYear})</h3>
                        <p>Fee: LKR ${b.monthlyFee}</p>
                        <button class="dashboard-button" style="background:#ffc107; color:black; margin-right:5px; margin-top:10px;" onclick="showEditBatchForm(${b.batchId}, '${escapeHtml(b.batchName)}', ${b.batchYear}, ${b.monthlyFee}, ${b.institute ? b.institute.instituteId : ''}, ${b.curriculum ? b.curriculum.curriculumId : ''}, '${b.syllabusType || 'CAMBRIDGE'}', '${b.examLevel || 'A_LEVEL'}')">Edit</button>
                        <button class="dashboard-button" style="background:#dc3545; margin-top:10px;" onclick="deleteBatch(${b.batchId})">Delete</button>
                    </div>`;
            });
        }
        html += "</div>";
        content.innerHTML = html;
    } catch (e) { content.innerHTML = "<p>Error loading batches.</p>"; }
}

async function showAddBatchForm() {
    renderBatchForm("Add Course Batch", "addBatch()");
}

async function showEditBatchForm(id, name, year, fee, instId, currId, syllabus, level) {
    renderBatchForm("Edit Course Batch", `updateBatch(${id})`, { batchName: name, batchYear: year, monthlyFee: fee, instituteId: instId, curriculumId: currId, syllabusType: syllabus, examLevel: level });
}

async function renderBatchForm(titleText, actionFunction, editData = null) {
    const content = document.getElementById("content");

    let instituteOptions = "<option value=''>Loading institutes...</option>";
    let curriculumOptions = "<option value=''>Loading curricula...</option>";
    try {
        const [instRes, currRes] = await Promise.all([
            fetch("http://localhost:8081/api/management/institutes"),
            fetch("http://localhost:8081/api/management/curricula")
        ]);
        const institutes = await instRes.json();
        const curricula = await currRes.json();

        instituteOptions = institutes.map(i => `<option value="${i.instituteId}" ${editData && editData.instituteId === i.instituteId ? 'selected' : ''}>${escapeHtml(i.name)}</option>`).join('');
        curriculumOptions = curricula.map(c => `<option value="${c.curriculumId}" ${editData && editData.curriculumId === c.curriculumId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
    } catch (err) {
        console.error(err);
    }

    content.innerHTML = `
        <button class="dashboard-button" onclick="showBatches()">← Back to Batches</button>
        <h2>${titleText}</h2>
        <div class="form-card" style="background:#fff; padding:20px; border-radius:8px; margin-top:15px;">
            <div id="formMessage" class="alert-banner" style="display:none;"></div>
            <label>Batch Name</label>
            <input type="text" id="batchName" value="${editData ? escapeHtml(editData.batchName) : ''}" placeholder="e.g. 2028 A/L Physics" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
            
            <label>Batch Year</label>
            <input type="number" id="batchYear" value="${editData ? editData.batchYear : 2026}" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
            
            <label>Monthly Fee (LKR)</label>
            <input type="number" id="monthlyFee" value="${editData ? editData.monthlyFee : 3500}" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">

            <label>Institute</label>
            <select id="batchInstituteId" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
                ${instituteOptions}
            </select>

            <label>Curriculum</label>
            <select id="batchCurriculumId" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
                ${curriculumOptions}
            </select>

            <label>Syllabus Type</label>
            <select id="batchSyllabusType" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
                <option value="CAMBRIDGE" ${editData && editData.syllabusType === 'CAMBRIDGE' ? 'selected' : ''}>Cambridge</option>
                <option value="EDEXCEL" ${editData && editData.syllabusType === 'EDEXCEL' ? 'selected' : ''}>Edexcel</option>
                <option value="LOCAL" ${editData && editData.syllabusType === 'LOCAL' ? 'selected' : ''}>Local</option>
            </select>

            <label>Exam Level</label>
            <select id="batchExamLevel" style="width:100%; padding:8px; margin-top:5px; margin-bottom:15px;">
                <option value="A_LEVEL" ${editData && editData.examLevel === 'A_LEVEL' ? 'selected' : ''}>A/L</option>
                <option value="O_LEVEL" ${editData && editData.examLevel === 'O_LEVEL' ? 'selected' : ''}>O/L</option>
            </select>

            <button class="dashboard-button" onclick="${actionFunction}">${titleText}</button>
        </div>
    `;
}

async function addBatch() {
    submitBatchData("http://localhost:8081/api/management/batches", "POST");
}

async function updateBatch(id) {
    submitBatchData(`http://localhost:8081/api/management/batches/${id}`, "PUT");
}

async function submitBatchData(url, method) {
    const batchName = document.getElementById("batchName").value.trim();
    const batchYear = document.getElementById("batchYear").value;
    const monthlyFee = document.getElementById("monthlyFee").value;
    const instituteId = document.getElementById("batchInstituteId").value;
    const curriculumId = document.getElementById("batchCurriculumId").value;
    const syllabusType = document.getElementById("batchSyllabusType").value;
    const examLevel = document.getElementById("batchExamLevel").value;
    const msg = document.getElementById("formMessage");

    if (!batchName || !instituteId || !curriculumId) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Please fill in batch name, institute, and curriculum.";
        msg.style.display = "block";
        return;
    }

    const payload = {
        batchName,
        batchYear: parseInt(batchYear),
        monthlyFee: parseFloat(monthlyFee),
        syllabusType,
        examLevel,
        institute: { instituteId: parseInt(instituteId) },
        curriculum: { curriculumId: parseInt(curriculumId) }
    };

    try {
        msg.className = "alert-banner alert-success";
        msg.textContent = "Processing batch...";
        msg.style.display = "block";

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Operation failed");

        msg.textContent = "Batch saved successfully!";
        setTimeout(() => { showBatches(); }, 1200);
    } catch (e) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Error saving batch to server.";
        msg.style.display = "block";
    }
}

async function deleteBatch(id) {
    if (!confirm("Are you sure?")) return;
    try {
        await fetch(`http://localhost:8081/api/management/batches/${id}`, { method: "DELETE" });
        showBatches();
    } catch (e) { console.error(e); }
}

// 9. LEARNING MATERIALS MODULE
async function showMaterials() {
    const content = document.getElementById("content");
    content.innerHTML = "<p>Loading learning materials...</p>";

    try {
        const response = await fetch("http://localhost:8081/api/learning-materials");
        if (!response.ok) throw new Error("Failed to load learning materials");
        const materials = await response.json();

        let html = `
            <button class="dashboard-button" onclick="showDashboard()">← Back to Dashboard</button>
            <h2>Learning Materials</h2>
            <button class="dashboard-button" onclick="showUploadMaterialForm()" style="margin-left: 10px;">+ Upload Material</button>
            <div style="margin-top: 20px;">
        `;

        if (materials.length === 0) {
            html += "<p>No learning materials uploaded yet.</p>";
        } else {
            materials.forEach(mat => {
                html += `
                    <div class="institute-card" style="margin-bottom: 15px; background:#fff; padding:15px; border-radius:6px;">
                        <h3>${escapeHtml(mat.title)}</h3>
                        <p><strong>Type:</strong> ${escapeHtml(mat.materialType)} | <strong>Week:</strong> ${mat.weekNumber}</p>
                        <p>${escapeHtml(mat.description || 'No description provided.')}</p>
                        <a href="http://localhost:8081/api/learning-materials/files/${mat.materialId}" target="_blank" class="dashboard-button" style="display:inline-block; margin-top:10px; text-decoration:none; text-align:center;">📥 View / Download File</a>
                        <button class="dashboard-button" style="background:#ffc107; color:black; margin-left:10px;" onclick="showEditMaterialForm(${mat.materialId}, '${escapeHtml(mat.title)}', ${mat.weekNumber}, '${escapeHtml(mat.materialType)}', '${escapeHtml(mat.description || '')}')">Edit</button>
                        <button class="dashboard-button" style="background:#dc3545; margin-left:10px;" onclick="deleteMaterial(${mat.materialId})">Delete</button>
                    </div>
                `;
            });
        }
        html += "</div>";
        content.innerHTML = html;
    } catch (e) {
        console.error(e);
        content.innerHTML = "<p>Error loading learning materials from server.</p>";
    }
}

function showUploadMaterialForm() {
    renderMaterialForm("Upload Study Material", "uploadMaterialFile()");
}

async function renderMaterialForm(titleText, actionFunction, editData = null) {
    const content = document.getElementById("content");
    let batchOptions = "<option value=''>Loading batches...</option>";
    try {
        const res = await fetch("http://localhost:8081/api/management/batches");
        const batches = await res.json();
        batchOptions = batches.map(b => `<option value="${b.batchId}" ${editData && editData.batch && editData.batch.batchId === b.batchId ? 'selected' : ''}>${escapeHtml(b.batchName)} (${b.batchYear})</option>`).join('');
    } catch (err) {
        batchOptions = "<option value=''>Error loading batches</option>";
    }

    content.innerHTML = `
        <button class="dashboard-button" onclick="showMaterials()">← Back to Materials</button>
        <h2>${titleText}</h2>
        <div class="form-card" style="background:#fff; padding:20px; border-radius:8px; margin-top:15px;">
            <div id="formMessage" class="alert-banner" style="display:none;"></div>
            <label for="materialTitle">Title</label>
            <input type="text" id="materialTitle" value="${editData ? escapeHtml(editData.title) : ''}" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">

            <label for="materialBatchId">Select Course Batch</label>
            <select id="materialBatchId" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
                ${batchOptions}
            </select>

            <label for="materialWeek">Week Number</label>
            <input type="number" id="materialWeek" min="1" max="52" value="${editData ? editData.weekNumber : 1}" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">

            <label for="materialType">Material Type</label>
            <select id="materialType" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">
                <option value="NOTES" ${editData && editData.materialType === 'NOTES' ? 'selected' : ''}>Lecture Notes</option>
                <option value="ASSIGNMENT" ${editData && editData.materialType === 'ASSIGNMENT' ? 'selected' : ''}>Assignment</option>
                <option value="TUTORIAL" ${editData && editData.materialType === 'TUTORIAL' ? 'selected' : ''}>Tutorial</option>
                <option value="RECORDING" ${editData && editData.materialType === 'RECORDING' ? 'selected' : ''}>Recording Link</option>
            </select>

            <label for="materialDesc">Description</label>
            <textarea id="materialDesc" style="width:100%; padding:8px; margin-top:5px; margin-bottom:10px;">${editData ? escapeHtml(editData.description || '') : ''}</textarea>

            <label for="materialFile">Choose File (Required for new, optional for edit)</label>
            <input type="file" id="materialFile" style="margin-top:5px; margin-bottom:15px; display:block;">

            <button class="dashboard-button" onclick="${actionFunction}">${titleText}</button>
        </div>
    `;
}

function showEditMaterialForm(id, title, week, type, desc) {
    renderMaterialForm("Edit Study Material", `updateMaterialFile(${id})`, { title, weekNumber: week, materialType: type, description: desc });
}

async function uploadMaterialFile() {
    submitMaterialData("http://localhost:8081/api/learning-materials/upload", "POST");
}

async function updateMaterialFile(id) {
    submitMaterialData(`http://localhost:8081/api/learning-materials/${id}`, "PUT");
}

async function submitMaterialData(url, method) {
    const title = document.getElementById("materialTitle").value.trim();
    const batchId = document.getElementById("materialBatchId").value;
    const weekNumber = document.getElementById("materialWeek").value;
    const materialType = document.getElementById("materialType").value;
    const description = document.getElementById("materialDesc").value;
    const fileInput = document.getElementById("materialFile");
    const msg = document.getElementById("formMessage");

    if (!title || !batchId) {
        msg.className = "alert-banner alert-error";
        msg.textContent = "Please fill in title and batch.";
        msg.style.display = "block";
        return;
    }

    const formData = new FormData();
    if (fileInput.files.length > 0) {
        formData.append("file", fileInput.files[0]);
    }
    formData.append("batchId", batchId);
    formData.append("weekNumber", weekNumber);
    formData.append("title", title);
    formData.append("materialType", materialType);
    formData.append("description", description);

    try {
        msg.className = "alert-banner alert-success";
        msg.textContent = "Processing submission, please wait...";
        msg.style.display = "block";

        const res = await fetch(url, {
            method: method,
            body: formData
        });

        if (!res.ok) throw new Error("Operation failed");

        msg.textContent = "Saved successfully!";
        setTimeout(() => { showMaterials(); }, 1200);
    } catch (e) {
        console.error(e);
        msg.className = "alert-banner alert-error";
        msg.textContent = "Error saving material to server.";
        msg.style.display = "block";
    }
}

async function deleteMaterial(id) {
    if (!confirm("Are you sure you want to delete this material?")) return;
    try {
        await fetch(`http://localhost:8081/api/learning-materials/${id}`, { method: "DELETE" });
        showMaterials();
    } catch (e) { console.error(e); }
}

// UTILS
function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}