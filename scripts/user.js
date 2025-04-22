document.addEventListener('DOMContentLoaded', () => {
    loadUserData()
        .then(() => {
            setupTabSwitching();
            loadBorrowedBooks();
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            showError('Failed to load user data. Please try again later.');
        });

    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.dashboard-tab');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');

            navItems.forEach(nav => nav.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

});
async function loadUserData() {
    try {
        const response = await fetch('../Data/users.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        localStorage.setItem('users', JSON.stringify(users));
        const currentUserName = localStorage.getItem('currentUser');
        const currentUser = users.find(user => user.name === currentUserName);
        if (!currentUser) {
            throw new Error('User not found');
        }

        document.querySelector('.user-avatar').src = currentUser.avatar;
        document.querySelector('.user-name').textContent = currentUser.name;
        document.querySelector('.user-email').textContent = currentUser.email;
        document.getElementById('displayName').value = currentUser.name;
        document.getElementById('email').value = currentUser.email;
        document.getElementById('darkMode').checked = currentUser.settings.darkMode;

    } catch (error) {
        throw new Error('Failed to load user data: ' + error.message);
    }
}

function setupTabSwitching() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.dashboard-tab');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            navItems.forEach(nav => nav.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}
