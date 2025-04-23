document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.querySelector('.login');
    const signupBtn = document.querySelector('.signup');
    const logoutBtn = document.querySelector('.logout');
    const userPage = document.querySelector('.user-icon');

    const isLoggedIn = getCookie('isLoggedIn');

    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        userPage.style.display = 'inline-block';
    } else {
        loginBtn.style.display = 'inline-block';
        signupBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        userPage.style.display = 'none';
    }

    logoutBtn.addEventListener('click', logout);
});

function logout() {
    deleteCookie('userData');
    deleteCookie('isLoggedIn');
    deleteCookie('sessionToken');

    localStorage.removeItem('currentUser');
    localStorage.removeItem('session');

    window.location.href = 'login.html';
}
