let users = [];

document.addEventListener('DOMContentLoaded', () => {

    loadUserData()
        .then(userData => {
            users = userData;
            localStorage.setItem('users', JSON.stringify(userData));
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

    if (checkUser(userNameInput, passwordInput, users)) {
        localStorage.setItem('currentUser', userNameInput);
        setCookie('isLoggedIn', true, 7);
        window.location.href = 'user_page.html';
    } else if (checkCookieUser(userNameInput, passwordInput)) {
        localStorage.setItem('currentUser', userNameInput);
        setCookie('isLoggedIn', true, 7);
        window.location.href = 'user_page.html';
    }
    else {
        showError('Invalid username or password');
    }
});

function checkCookieUser(userNameInput, passwordInput) {
    try {
        const users = localStorage.getItem('users');
        if (!users) {
            return false;
        }
        return users.some(user =>
            user.name === userNameInput &&
            user.password === passwordInput
        );

    } catch (error) {
        console.error('Error parsing cookie data:', error);
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
        const response = await fetch('../Data/users.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Failed to load user data: ' + error.message);
    }
}