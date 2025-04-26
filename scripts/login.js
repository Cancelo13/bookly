let users = [];

document.addEventListener('DOMContentLoaded', () => {

    loadUserData()
        .then(userData => {
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]');

            users = userData.concat(localUsers.filter(user => !userData.some(u => u.username === user.username)));
            localStorage.setItem('users', JSON.stringify(users));
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            showError('Failed to load user data. Please try again later.');
        });
});

document.querySelector('.login-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const userNameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();

    if (!userNameInput || !passwordInput) {
        showError('Please enter both username and password');
        return;
    }

    if (checkCookieUser(userNameInput, passwordInput)) {
        localStorage.setItem('currentUser', userNameInput);
        setCookie('isLoggedIn', true, 7);
        window.location.href = 'user_page.html';
    } else {
        showError('Invalid username or password');
    }
});

function checkCookieUser(userNameInput, passwordInput) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(user =>
            (user.username.toLowerCase() === userNameInput.toLowerCase() ||
                user.name.toLowerCase() === userNameInput.toLowerCase()) &&
            user.password === passwordInput
        );

        if (user) {
            createSession(user);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking user credentials:', error);
        return false;
    }
}
function checkUser(userNameInput, passwordInput, users) {
    if (!users || !Array.isArray(users)) {
        console.error('Invalid users data');
        return false;
    }

    return users.some(user =>
        user.name === userNameInput &&
        user.password === passwordInput
    );
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

async function loadUserData() {
    try {
        const response = await fetch('./Data/users.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Failed to load user data: ' + error.message);
    }
}