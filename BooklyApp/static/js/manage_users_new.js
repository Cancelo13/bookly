// Enhanced manage_users.js with improved search and edit functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Manage Users JS loaded successfully');
    
    // Get DOM elements
    const searchInput = document.getElementById('search-input');
    const userRows = document.querySelectorAll('.users-table tbody tr');
    const noResultsMessage = document.getElementById('no-results-message');
    const editButtons = document.querySelectorAll('.edit-user-btn');
    const userEditForm = document.querySelector('.user-edit-form');
    
    // Initialize variables
    let editFormVisible = false;
    
    // Add role badges to the role cells
    userRows.forEach(row => {
        const roleCell = row.querySelector('td:nth-child(5)');
        if (roleCell) {
            const roleText = roleCell.textContent.trim();
            if (!roleCell.querySelector('.role-badge')) {
                roleCell.innerHTML = `<span class="role-badge ${roleText.toLowerCase()}-role">${roleText}</span>`;
            }
        }
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            console.log('Searching for:', searchTerm);
            
            let resultsFound = false;
            
            userRows.forEach(row => {
                // Check username, email, first name, and last name
                const username = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
                const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const firstName = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                const lastName = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
                
                // If any field contains the search term, show the row
                if (username.includes(searchTerm) || 
                    email.includes(searchTerm) || 
                    firstName.includes(searchTerm) || 
                    lastName.includes(searchTerm)) {
                    row.style.display = '';
                    resultsFound = true;
                    console.log('Match found:', username);
                } else {
                    row.style.display = 'none';
                }
            });
            
            // Show/hide no results message
            if (noResultsMessage) {
                if (resultsFound || searchTerm === '') {
                    noResultsMessage.style.display = 'none';
                } else {
                    noResultsMessage.style.display = 'block';
                }
            }
        });
    }
    
    // Edit user functionality
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            console.log('Edit button clicked for user ID:', userId);
            
            // Find the user's row and get their data
            const userRow = this.closest('tr');
            const username = userRow.querySelector('td:nth-child(1)').textContent.trim();
            const email = userRow.querySelector('td:nth-child(2)').textContent.trim();
            const firstName = userRow.querySelector('td:nth-child(3)').textContent.trim();
            const lastName = userRow.querySelector('td:nth-child(4)').textContent.trim();
            const isAdmin = userRow.querySelector('td:nth-child(5)').textContent.includes('Admin');
            
            // Get the user result container
            const userResult = document.getElementById('user-result');
            console.log('User result container:', userResult);
            
            if (!userResult) {
                console.error('Error: user-result container not found');
                return;
            }
            
            // Make sure the user-result container is visible
            userResult.style.display = 'block';
            console.log('Set user-result display to block');
            
            // Get CSRF token from any form on the page
            const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]') ? 
                            document.querySelector('input[name="csrfmiddlewaretoken"]').value : '';
            
            // Create edit form HTML with improved styling
            console.log('Creating edit form for user:', username);
            userResult.innerHTML = `
                <div class="user-edit-form" style="display: block; opacity: 1; transform: translateY(0);">
                    <h3>Edit User: ${username}</h3>
                    <form id="edit-user-form" action="/user/${userId}/update/" method="post">
                        <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                        <div class="form-group">
                            <label for="edit-username">Username:</label>
                            <input type="text" id="edit-username" name="username" value="${username}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="edit-email">Email:</label>
                            <input type="email" id="edit-email" name="email" value="${email}">
                        </div>
                        <div class="form-group">
                            <label for="edit-first-name">First Name:</label>
                            <input type="text" id="edit-first-name" name="first_name" value="${firstName}">
                        </div>
                        <div class="form-group">
                            <label for="edit-last-name">Last Name:</label>
                            <input type="text" id="edit-last-name" name="last_name" value="${lastName}">
                        </div>
                        <div class="form-group">
                            <label>Current Role:</label>
                            <span class="role-badge ${isAdmin ? 'admin-role' : 'user-role'}">
                                ${isAdmin ? 'Admin' : 'User'}
                            </span>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="save-btn">Save Changes</button>
                            <button type="button" class="cancel-btn" id="cancel-edit-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
            
            // Add event listener to the form
            console.log('Adding event listener to form');
            setTimeout(() => {
                const form = document.getElementById('edit-user-form');
                console.log('Form element:', form);
                if (form) {
                    form.addEventListener('submit', function(e) {
                        console.log('Form submitted');
                        e.preventDefault();
                        updateUser(userId, this);
                    });
                    console.log('Submit event listener added to form');
                } else {
                    console.error('Form element not found');
                }
            }, 100); // Small delay to ensure the DOM is updated
            
            // Add event listener to the cancel button
            const cancelButton = document.getElementById('cancel-edit-btn');
            if (cancelButton) {
                cancelButton.addEventListener('click', function() {
                    hideEditForm();
                });
            }
            
            // Show the form with animation
            userResult.style.display = 'block';
            setTimeout(() => {
                const formElement = userResult.querySelector('.user-edit-form');
                if (formElement) {
                    formElement.style.opacity = '1';
                    formElement.style.transform = 'translateY(0)';
                }
            }, 10);
            
            // Scroll to the form
            userResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
            editFormVisible = true;
        });
    });
    
    // Function to update user data via AJAX
    function updateUser(userId, form) {
        console.log('Updating user with ID:', userId);
        
        // Get form data
        const formData = new FormData(form);
        
        // Create and configure the fetch request
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
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'alert alert-success';
                successMessage.textContent = 'User updated successfully!';
                form.prepend(successMessage);
                
                // Hide the message after 2 seconds
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    setTimeout(() => {
                        successMessage.remove();
                        // Reload the page to show updated data
                        window.location.reload();
                    }, 300);
                }, 2000);
                
                // Hide the form
                setTimeout(hideEditForm, 2500);
            } else {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-error';
                errorMessage.textContent = data.error || 'An error occurred while updating the user.';
                form.prepend(errorMessage);
                
                // Hide the message after 3 seconds
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
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-error';
            errorMessage.textContent = 'An error occurred while updating the user: ' + error.message;
            form.prepend(errorMessage);
            
            // Hide the message after 3 seconds
            setTimeout(() => {
                errorMessage.style.opacity = '0';
                setTimeout(() => {
                    errorMessage.remove();
                }, 300);
            }, 3000);
        });
    }
    
    // Function to hide the edit form
    function hideEditForm() {
        console.log('Hiding edit form');
        const userResult = document.getElementById('user-result');
        if (userResult) {
            const form = userResult.querySelector('.user-edit-form');
            if (form) {
                form.style.opacity = '0';
                form.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    userResult.style.display = 'none';
                }, 300);
            } else {
                userResult.style.display = 'none';
            }
            editFormVisible = false;
        }
    }
    
    // Close edit form when clicking outside
    document.addEventListener('click', function(e) {
        if (editFormVisible) {
            const form = document.querySelector('.user-edit-form');
            if (form && !form.contains(e.target) && !e.target.classList.contains('edit-user-btn')) {
                hideEditForm();
            }
        }
    });
});
