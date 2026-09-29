document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents the page from reloading

    // 1. Gather data from the form fields
    const userData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        passwordHash: document.getElementById('passwordHash').value
    };

    const messageElement = document.getElementById('message');
    messageElement.style.color = 'blue';
    messageElement.textContent = 'Registering...';

    // 2. Send the POST request to your Java backend
    fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Registration failed. Email might already exist.');
            }
        })
        .then(data => {
            messageElement.style.color = 'green';
            messageElement.textContent = 'Registration Successful! Welcome ' + data.fullName;
            document.getElementById('registrationForm').reset();
        })
        .catch(error => {
            messageElement.style.color = 'red';
            messageElement.textContent = error.message;
        });
});