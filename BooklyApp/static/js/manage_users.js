let currentUser = null;
let editFormVisible = false;

document.addEventListener('DOMContentLoaded', () => {    
    const editButtons = document.querySelectorAll('.edit-user-btn');    
    const userResult = document.getElementById('user-result');
    
    initializeSearch();
    initializeEditButtons();
    initializeRoleBadges();
    
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
    
    document.addEventListener('click', function(e) {
        if (editFormVisible) {
            const form = document.querySelector('.user-edit-form');
            const userResult = document.getElementById('user-result');
            if (userResult && form && !form.contains(e.target) && !e.target.classList.contains('edit-user-btn')) {
                hideEditForm();
            }
        }
    });
});

function initializeSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-user');

    searchBtn.addEventListener('click', () => {
        const searchValue = searchInput.value.trim();
        searchUser(searchValue);
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchValue = searchInput.value.trim();
            searchUser(searchValue);
        }
    });
    
    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.trim();
        searchUser(searchValue);
    });
}

function searchUser(username) {
    const searchTerm = username.toLowerCase().trim();
    const tableRows = document.querySelectorAll('.users-table tbody tr');
    
    if (searchTerm === '') {
        tableRows.forEach(row => {
            row.style.display = '';
        });
        
        const noResultsMessage = document.getElementById('no-results-message');
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
        return;
    }
    
    let found = false;
    
    tableRows.forEach(row => {
        const usernameCell = row.querySelector('td:nth-child(1)');
        const emailCell = row.querySelector('td:nth-child(2)');
        const firstNameCell = row.querySelector('td:nth-child(3)');
        const lastNameCell = row.querySelector('td:nth-child(4)');
        
        const usernameText = usernameCell ? usernameCell.textContent.toLowerCase() : '';
        const emailText = emailCell ? emailCell.textContent.toLowerCase() : '';
        const firstNameText = firstNameCell ? firstNameCell.textContent.toLowerCase() : '';
        const lastNameText = lastNameCell ? lastNameCell.textContent.toLowerCase() : '';
        
        if (usernameText.includes(searchTerm) || 
            emailText.includes(searchTerm) || 
            firstNameText.includes(searchTerm) || 
            lastNameText.includes(searchTerm)) {
            row.style.display = '';
            found = true;
        } else {
            row.style.display = 'none';
        }
    });
    
    const noResultsMessage = document.getElementById('no-results-message');
    if (!found) {
        if (noResultsMessage) {
            noResultsMessage.style.display = 'block';
            noResultsMessage.textContent = `No users found matching "${searchTerm}"`;
        }
    } else if (noResultsMessage) {
        noResultsMessage.style.display = 'none';
    }
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

// Function to add role badges to the role cells
function initializeRoleBadges() {
    const userRows = document.querySelectorAll('.users-table tbody tr');
    
    userRows.forEach(row => {
        const roleCell = row.querySelector('td:nth-child(5)');
        if (roleCell && !roleCell.querySelector('.role-badge')) {
            const roleText = roleCell.textContent.trim();
            if (roleText === 'Admin' || roleText === 'User') {
                roleCell.innerHTML = `<span class="role-badge ${roleText.toLowerCase()}-role">${roleText}</span>`;
            }
        }
    });
}

function initializeEditButtons() {
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('edit-user-btn')) {
            const userId = e.target.getAttribute('data-user-id');
            
            if (userId) {
                const userRow = e.target.closest('tr');
                if (userRow) {
                    userRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    userRow.classList.add('highlight');
                    
                    const cells = userRow.querySelectorAll('td');
                    const userData = {
                        username: cells[0].textContent.trim(),
                        email: cells[1].textContent.trim(),
                        firstName: cells[2].textContent.trim(),
                        lastName: cells[3].textContent.trim(),
                        isAdmin: cells[4].textContent.includes('Admin')
                    };
                    
                    showEditForm(userId, userData);
                    
                    setTimeout(() => {
                        userRow.classList.remove('highlight');
                    }, 2000);
                }
            }
        }
    });
    
    const editButtons = document.querySelectorAll('.edit-user-btn');
    console.log('Found edit buttons:', editButtons.length);
}

function showEditForm(userId, userData) {
    console.log('showEditForm called for user:', userData.username);
    
    let userResult = document.getElementById('user-result');
    if (!userResult) {
        userResult = document.createElement('div');
        userResult.id = 'user-result';
        userResult.style.display = 'none';
        document.querySelector('.users-list').appendChild(userResult);
    }
    
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]') ? 
                     document.querySelector('input[name="csrfmiddlewaretoken"]').value : '';
    
    console.log('CSRF token found:', csrfToken ? 'Yes' : 'No');
    
    const formHtml = `
        <div class="user-edit-form" style="opacity: 0; transform: translateY(20px);">
            <h3>Edit User: ${userData.username}</h3>
            <form id="edit-user-form" action="/user/${userId}/update/" method="post">
                <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                <div class="form-group">
                    <label for="edit-username">Username:</label>
                    <input type="text" id="edit-username" name="username" value="${userData.username}" readonly>
                </div>
                <div class="form-group">
                    <label for="edit-email">Email:</label>
                    <input type="email" id="edit-email" name="email" value="${userData.email}" required>
                </div>
                <div class="form-group">
                    <label for="edit-first-name">First Name:</label>
                    <input type="text" id="edit-first-name" name="first_name" value="${userData.firstName}">
                </div>
                <div class="form-group">
                    <label for="edit-last-name">Last Name:</label>
                    <input type="text" id="edit-last-name" name="last_name" value="${userData.lastName}">
                </div>
                <div class="form-group">
                    <label>Current Role:</label>
                    <span class="role-badge ${userData.isAdmin ? 'admin-role' : 'user-role'}">
                        ${userData.isAdmin ? 'Admin' : 'User'}
                    </span>
                </div>
                <div class="form-actions">
                    <button type="submit" class="save-btn">Save Changes</button>
                    <button type="button" class="cancel-btn" id="cancel-edit-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    userResult.innerHTML = formHtml;
    userResult.style.display = 'block';
    
    const form = document.getElementById('edit-user-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            updateUser(userId, this);
        });
    } else {
        console.error('Form element not found after creating it');
    }
    
    const cancelButton = document.getElementById('cancel-edit-btn');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            hideEditForm();
        });
    } else {
        console.error('Cancel button not found after creating it');
    }
    
    setTimeout(() => {
        const formElement = userResult.querySelector('.user-edit-form');
        if (formElement) {
            formElement.style.opacity = '1';
            formElement.style.transform = 'translateY(0)';
        } else {
            console.error('Form element not found for animation');
        }
    }, 50);
    
    userResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    editFormVisible = true;
}

function updateUser(userId, form) {
    console.log('Updating user with ID:', userId);
    
    const formData = new FormData(form);
    
    fetch('/user/' + userId + '/update/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Server returned status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Update response:', data);
        if (data.success) {
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.textContent = 'User updated successfully!';
            form.prepend(successMessage);
            
            setTimeout(() => {
                successMessage.style.opacity = '0';
                setTimeout(() => {
                    successMessage.remove();
                    window.location.reload();
                }, 300);
            }, 2000);
            
            setTimeout(hideEditForm, 2500);
        } else {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-error';
            errorMessage.textContent = data.error || 'An error occurred while updating the user.';
            form.prepend(errorMessage);
            
            setTimeout(() => {
                errorMessage.style.opacity = '0';
                setTimeout(() => {
                    errorMessage.remove();
                }, 300);
            }, 3000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-error';
        errorMessage.textContent = 'An error occurred while updating the user: ' + error.message;
        form.prepend(errorMessage);
        
        setTimeout(() => {
            errorMessage.style.opacity = '0';
            setTimeout(() => {
                errorMessage.remove();
            }, 300);
        }, 3000);
    });
}

function hideEditForm() {
    console.log('Hiding edit form');
    const userResult = document.getElementById('user-result');
    if (userResult) {
        userResult.style.display = 'none';
        userResult.innerHTML = '';
        editFormVisible = false;
        console.log('Edit form hidden successfully');
    } else {
        console.log('No edit form found to hide');
    }
}