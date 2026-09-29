// ==========================================
// 1. REGISTRATION LOGIC (Runs only on index.html)
// ==========================================
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
                messageElement.textContent = 'Registration Successful! Welcome ' + data.fullName;
                registrationForm.reset();
            })
            .catch(error => {
                messageElement.style.color = 'red';
                messageElement.textContent = error.message;
            });
    });
}

// ==========================================
// 2. LOGIN LOGIC (Runs only on login.html)
// ==========================================
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
                    messageElement.style.color = 'green';
                    messageElement.textContent = 'Login Successful!';
                } else {
                    throw new Error('Invalid email or password.');
                }
            })
            .catch(error => {
                messageElement.style.color = 'red';
                messageElement.textContent = error.message;
            });
    });
}