document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.querySelector('.login');
    const signupBtn = document.querySelector('.signup');
    const logoutBtn = document.querySelector('.logout');
    const userIcon = document.querySelector('.user-icon');
    
    const isAuthenticated = document.body.hasAttribute('data-user-authenticated');
    
    if (isAuthenticated) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (userIcon) userIcon.style.display = 'inline-block';
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userIcon) userIcon.style.display = 'none';
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = '/logout/';
        });
    }
});
