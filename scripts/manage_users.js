let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
    const verifySaveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    if (verifySaveBtn) {
        verifySaveBtn.addEventListener('click', () => {
            const username = document.getElementById('admin-username').value.trim();
            const password = document.getElementById('admin-password').value.trim();

            if (!username || !password) {
                showError('Please fill in all fields');
                return;
            }

            saveChanges(username, password);
        });
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const modal = document.getElementById('admin-verification-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

});

function initializeSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-user');

    searchBtn.addEventListener('click', () => {
        const searchValue = searchInput.value.trim();
        if (searchValue) searchUser(searchValue);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchValue = searchInput.value.trim();
            if (searchValue) {
                searchUser(searchValue);
            }
        }
    });
}

function searchUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id.toString() === userId.trim());

    if (!user) {
        showError('No user found with this ID');
        return;
    }

    currentUser = user;
    displayUserInfo(user);
}

function displayUserInfo(user) {
    const userResult = document.getElementById('user-result');
    userResult.innerHTML = `
        <div class="user-card">
            <div class="user-avatar">
                <img src="${user.avatar}" alt="User Avatar">
            </div>
            <div class="user-info">
                <div class="input-group">
                    <label>ID:</label>
                    <input type="text" id="edit-id" value="${user.id}" disabled>
                    <button class="edit-btn" onclick="toggleEdit('edit-id')">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="input-group">
                    <label>Username:</label>
                    <input type="text" value="${user.username}" disabled>
                </div>
                <div class="input-group">
                    <label>Email:</label>
                    <input type="email" value="${user.email}" disabled>
                </div>
                <div class="input-group">
                    <label>Admin Status:</label>
                    <button class="admin-status" id="admin-status-btn" onclick="toggleAdminStatus()">
                        ${user.isAdmin ?
            '<i class="fas fa-check-circle" style="color: green;"></i>' :
            '<i class="fas fa-times-circle" style="color: red;"></i>'}
                    </button>
                </div>
                <button class="save-changes-btn" onclick="showAdminVerification()">
                    Save Changes
                </button>
            </div>
        </div>
    `;
}

function toggleEdit(inputId) {
    const input = document.getElementById(inputId);
    input.disabled = !input.disabled;
    if (!input.disabled) input.focus();
}

function toggleAdminStatus() {
    const btn = document.getElementById('admin-status-btn');
    const isCurrentlyAdmin = btn.innerHTML.includes('check-circle');

    btn.innerHTML = isCurrentlyAdmin ?
        '<i class="fas fa-times-circle" style="color: red;"></i>' :
        '<i class="fas fa-check-circle" style="color: green;"></i>';
}

function showAdminVerification() {
    const modal = document.getElementById('admin-verification-modal');
    modal.style.display = 'block';
}

function saveChanges(adminUsername, adminPassword) {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log('Current users:', users); 

        const adminUser = users.find(u =>
            u.username.toLowerCase() === adminUsername.toLowerCase() &&
            u.password === adminPassword &&
            u.isAdmin === true
        );

        if (!adminUser) {
            showError('Invalid admin credentials');
            return;
        }

        const newId = document.getElementById('edit-id').value.trim();
        const newAdminStatus = document.getElementById('admin-status-btn')
            .innerHTML.includes('check-circle');

        if (!newId) {
            showError('ID cannot be empty');
            return;
        }

        const isDuplicateId = users.some(u =>
            u.id.toString() === newId &&
            u.id.toString() !== currentUser.id.toString()
        );

        if (isDuplicateId) {
            showError('This ID is already in use');
            return;
        }

        const userIndex = users.findIndex(u => u.id.toString() === currentUser.id.toString());

        if (userIndex === -1) {
            showError('User not found');
            return;
        }

        const updatedUser = {
            ...users[userIndex],
            id: newId,
            isAdmin: newAdminStatus
        };

        users[userIndex] = updatedUser;
        console.log('Updated user:', updatedUser); 

        localStorage.setItem('users', JSON.stringify(users));
        console.log('Saved users:', JSON.parse(localStorage.getItem('users')));

        currentUser = updatedUser;

        showSuccess('User updated successfully');
        document.getElementById('admin-verification-modal').style.display = 'none';
        displayUserInfo(currentUser);

    } catch (error) {
        console.error('Error saving changes:', error);
        showError('Failed to save changes: ' + error.message);
    }
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}