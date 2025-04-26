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

    const settingsForm = document.querySelector('.settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveUserSettings);
    }
});
async function loadUserData() {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUserName = localStorage.getItem('currentUser');

        const currentUser = users.find(user =>
            user.username.toLowerCase() === currentUserName.toLowerCase() ||
            user.name.toLowerCase() === currentUserName.toLowerCase()
        );

        if (!currentUser) {
            throw new Error('User not found');
        }

        document.querySelector('.user-avatar').src = currentUser.avatar;
        document.querySelector('.user-name').textContent = currentUser.name;
        document.querySelector('.user-email').textContent = currentUser.email;
        document.getElementById('displayName').value = currentUser.name;
        document.getElementById('email').value = currentUser.email;
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

function loadBorrowedBooks() {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUserName = localStorage.getItem('currentUser');
        const currentUser = users.find(user =>
            user.username?.toLowerCase() === currentUserName?.toLowerCase() ||
            user.name?.toLowerCase() === currentUserName?.toLowerCase()
        );

        const borrowedBooksGrid = document.getElementById('borrowedBooksGrid');

        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const borrowedBooks = currentUser.borrowedBooks || [];

        if (borrowedBooks.length === 0) {
            borrowedBooksGrid.innerHTML = '<p class="no-books" style="color: #F5EFE7;" >No borrowed books yet.</p>';
            return;
        }

        const borrowedBooksHtml = borrowedBooks.map(bookTitle => {
            const book = books.find(b => b.title === bookTitle);
            if (!book) return '<p class="no-books" style="color: #F5EFE7;" >Book not found.</p>';

            return `
                <div class="book-card">
                    <img src="${book.thumbnail || 'images/default-book-cover.jpg'}" 
                         alt="${book.title}" 
                         class="book-cover"
                         onerror="this.src='images/default-book-cover.jpg'">
                    <div class="book-info" style="color: #F5EFE7;">
                        <h3>${book.title}</h3>
                        <p class="author">${book.author || 'Unknown Author'}</p>
                    </div>
                </div>
            `;
        }).join('');

        borrowedBooksGrid.innerHTML = borrowedBooksHtml;
    } catch (error) {
        console.error('Error loading borrowed books:', error);
    }
}

function saveUserSettings(e) {
    e.preventDefault();

    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUserName = localStorage.getItem('currentUser');
        const userIndex = users.findIndex(user =>
            user.username?.toLowerCase() === currentUserName?.toLowerCase() ||
            user.name?.toLowerCase() === currentUserName?.toLowerCase()
        );

        const newName = document.getElementById('displayName').value.trim();
        const newEmail = document.getElementById('email').value.trim();

        if (!newName || !newEmail) {
            return;
        }

        if (!isValidEmail(newEmail)) {
            return;
        }

        users[userIndex].name = newName;
        users[userIndex].email = newEmail;

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', newName); // Update current user name

        document.querySelector('.user-name').textContent = newName;
        document.querySelector('.user-email').textContent = newEmail;


    } catch (error) {
        console.error('Error saving settings:', error);
        showError('Failed to save settings');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
