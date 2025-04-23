document.addEventListener('DOMContentLoaded', () => {
    loadAdminUsers()
        .then(admins => {
            const currentUsername = localStorage.getItem('currentUser');
            if (!currentUsername) {
                window.location.href = 'index.html';
                return;
            }
            const users = JSON.parse(localStorage.getItem('users') || '[]');

            const currentUser = users.find(user =>
                user.username.toLowerCase() === currentUsername.toLowerCase() ||
                user.name.toLowerCase() === currentUsername.toLowerCase()
            );

            if (!currentUser || !admins.some(admin => admin.id === currentUser.id)) {
                window.location.href = 'index.html';
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
});

async function loadAdminUsers() {
    const response = await fetch('../Data/users.json');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const admins = data.filter(user => user.isAdmin === true);
    return admins;
}