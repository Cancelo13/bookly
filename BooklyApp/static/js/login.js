(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.querySelector('.login-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();
                
                if (!username || !password) {
                    e.preventDefault();
                    const errorDiv = document.getElementById('error-message');
                    if (errorDiv) {
                        errorDiv.textContent = 'Please enter both username and password';
                        errorDiv.style.display = 'block';
                    } else {
                        alert('Please enter both username and password');
                    }
                }
            });
        }
    });
})();