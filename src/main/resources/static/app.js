// 1. REGISTRATION LOGIC (Runs only on index.html)

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

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Registering...';
        messageElement.className = 'alert-banner';
        messageElement.style.display = 'none';

        fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Registration failed. Email might already exist.');
            })
            .then(data => {
                messageElement.className = 'alert-banner alert-success';
                messageElement.textContent = 'Registration Successful! Redirecting to sign in...';
                registrationForm.reset();

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            })
            .catch(error => {
                messageElement.className = 'alert-banner alert-error';
                messageElement.textContent = error.message;

                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Register';
            });
    });
}


// 2. LOGIN & ROLE-BASED REDIRECTION (Runs only on login.html)

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

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner"></span> Verifying...';
        messageElement.className = 'alert-banner';
        messageElement.style.display = 'none';

        fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
            .then(async response => {
                if (response.ok) {
                    return response.json();
                } else {
                    const errorText = await response.text();
                    let errorMessage = 'Invalid email or password.';
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.error || errorMessage;
                    } catch (e) {
                        if (errorText) errorMessage = errorText;
                    }
                    throw new Error(errorMessage);
                }
            })
            .then(user => {
                messageElement.className = 'alert-banner alert-success';
                messageElement.textContent = 'Login Successful! Redirecting...';

                // Save user details including userId to localStorage
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

                // Reset button state
                loginBtn.disabled = false;
                loginBtn.innerHTML = 'Login';
            });
    });
}


// 3. LOGOUT LOGIC (Runs on any dashboard page)

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.clear();
        window.location.href = 'login.html';
    });
}

// 4. ADMIN DASHBOARD USER MANAGEMENT (Runs only on admin-dashboard.html)

const adminUserTableBody = document.getElementById('adminUserTableBody');

if (adminUserTableBody) {
    const adminName = localStorage.getItem('userName') || 'Administrator';
    const welcomeEl = document.getElementById('welcomeAdmin');
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${adminName}`;

    fetchUsersForAdmin();
}

async function fetchUsersForAdmin() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();

        adminUserTableBody.innerHTML = '';
        users.forEach(user => {
            adminUserTableBody.innerHTML += `
                <tr>
                    <td style="padding: 10px;">${user.userId}</td>
                    <td style="padding: 10px;">${user.fullName}</td>
                    <td style="padding: 10px;">${user.email}</td>
                    <td style="padding: 10px;">${user.role}</td>
                    <td style="padding: 10px;"><strong>${user.accountStatus}</strong></td>
                    <td style="padding: 10px;">
                        <button onclick="openEditUserModal(${user.userId}, '${user.fullName}', '${user.email}', '${user.role}')" 
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

async function toggleUserStatus(userId, newStatus) {
    try {
        const response = await fetch(`/api/users/${userId}/status?status=${newStatus}`, {
            method: 'PUT'
        });
        if (response.ok) {
            fetchUsersForAdmin(); // Refresh list immediately
        } else {
            alert('Failed to update user status.');
        }
    } catch (err) {
        console.error('Error updating status:', err);
    }
}