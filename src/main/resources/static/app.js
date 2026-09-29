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

        const messageElement = document.getElementById('message');
        messageElement.style.color = 'blue';
        messageElement.textContent = 'Registering...';

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
                messageElement.style.color = 'green';
                messageElement.textContent = 'Registration Successful! Redirecting to sign in...';
                registrationForm.reset();

                // Automatically redirect to login page after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            })
            .catch(error => {
                messageElement.style.color = 'red';
                messageElement.textContent = error.message;
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

        const messageElement = document.getElementById('loginMessage');
        messageElement.style.color = 'blue';
        messageElement.textContent = 'Verifying credentials...';

        fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
            .then(response => {
                if (response.ok) {
                    return response.json(); // Extracts the user object returned by Spring Boot
                } else {
                    throw new Error('Invalid email or password.');
                }
            })
            .then(user => {
                messageElement.style.color = 'green';
                messageElement.textContent = 'Login Successful! Redirecting...';

                // Save user details to localStorage so dashboards can use them dynamically
                localStorage.setItem('userName', user.fullName);
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userRole', user.role);

                // Dynamically route based on the user's role from the database
                setTimeout(() => {
                    if (user.role === 'ADMIN') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (user.role === 'TUTOR') {
                        window.location.href = 'tutor-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html'; // Default Student Dashboard
                    }
                }, 1000);
            })
            .catch(error => {
                messageElement.style.color = 'red';
                messageElement.textContent = error.message;
            });
    });
}


// 3. LOGOUT LOGIC (Runs on any dashboard page)

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        // Clear stored session data on logout
        localStorage.clear();
        window.location.href = 'login.html';
    });
}