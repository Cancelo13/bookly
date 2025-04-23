let usersNamesArray = [];
let users = [];
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.register-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const userNameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();
        const confirmPasswordInput = document.getElementById('confirmPassword').value.trim();
        const emailInput = document.getElementById('email').value.trim();

        if (!userNameInput || !passwordInput || !emailInput) {
            showError('Please fill in all fields');
            return;
        }

        if (passwordInput !== confirmPasswordInput) {
            showError('Passwords do not match');
            return;
        }

        try {
            users = await loadUserData();
            usersNamesArray = userNames(users);

            if (!validateUserName(userNameInput, usersNamesArray)) {
                showError('Username already exists');
                return;
            }

            if (!validatePassword(passwordInput)) {
                showError('Password is too weak');
                return;
            }

            if (!validateEmail(emailInput)) {
                showError('Invalid email format');
                return;
            }

            const newUser = await registerUser(userNameInput, passwordInput, emailInput);

            setCookie('userData', JSON.stringify({
                username: newUser.username,
                name: newUser.name,
                password: newUser.password,
                email: newUser.email,
                id: newUser.id,
                avatar: newUser.avatar,
                borrowedBooks: newUser.borrowedBooks,
                settings: newUser.settings,
                isAdmin: newUser.isAdmin
            }), 7);

            //setCookie('isLoggedIn', true, 7);

            showSuccess('Registration successful! You can now log in.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Error during registration:', error);
            showError('Registration failed. Please try again later.');
        }
    })
});

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

function userNames(users) {
    return users.map(user => user.username.toLowerCase());
}

function validatePassword(passwordInput) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(passwordInput);
}

function validateEmail(emailInput) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailInput);
}

function validateUserName(userNameInput, usersNamesArray) {
    if (!userNameInput || userNameInput.length < 3) {
        return false;
    }
    if (usersNamesArray) {
        return !usersNamesArray.includes(userNameInput);
    }
    return true;
}

async function registerUser(userNameInput, passwordInput, emailInput) {
    const newUser = {
        id: Date.now(),
        name: userNameInput,
        username: userNameInput.toLowerCase(),
        password: passwordInput,
        email: emailInput,
        avatar: "images/default-avatar.png",
        borrowedBooks: [],
        settings: {
            darkMode: false
        },
        isAdmin: false,
    };
    try {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        existingUsers.push(newUser);

        localStorage.setItem('users', JSON.stringify(existingUsers));
        users = existingUsers;

        setCookie('users', JSON.stringify(existingUsers), 7);
        setCookie('userData', JSON.stringify(newUser), 7);
        createSession(newUser);
        return newUser;

    } catch (error) {
        console.error('Error saving user data:', error);
        throw new Error('Failed to save user data: ' + error.message);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';

    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}
