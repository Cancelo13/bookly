document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('id_password');
    const confirmPasswordInput = document.getElementById('id_confirm_password');
    
    if (passwordInput) {
        const strengthMeter = document.getElementById('password-strength');
        
        passwordInput.addEventListener('input', function() {
            const strength = calculatePasswordStrength(this.value);
            
            if (strengthMeter) {
                strengthMeter.className = 'strength-meter';
                if (strength.level !== 'none') {
                    strengthMeter.classList.add(`strength-${strength.level}`);
                }
            }
        });
    }
    
    if (passwordInput && confirmPasswordInput) {
        function validatePasswords() {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        }
        
        passwordInput.addEventListener('input', validatePasswords);
        confirmPasswordInput.addEventListener('input', validatePasswords);
    }
});


function calculatePasswordStrength(password) {
    if (!password) return { level: 'none', message: '' };
    
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    let level;
    if (password.length === 0) {
        level = 'none';
    } else if (strength <= 2) {
        level = 'weak';
    } else if (strength <= 4) {
        level = 'medium';
    } else {
        level = 'strong';
    }
    
    return { level, message: '' };
}
