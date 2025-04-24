let books = [];
let currentEditId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
  initEventListeners();
  handlePageAction();
});

async function loadBooks() {
  try {
    const storedBooks = localStorage.getItem('books');

    if (!storedBooks || JSON.parse(storedBooks).length === 0) {
      const response = await fetch('./Data/books.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonBooks = await response.json();

      books = jsonBooks.map(book => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: book.title || 'Untitled',
        author: Array.isArray(book.authors) && book.authors.length > 0
          ? book.authors.join(', ')
          : 'Unknown',
        description: book.description || 'No description available',
        categories: Array.isArray(book.categories) && book.categories.length > 0
          ? book.categories.join(', ')
          : 'Uncategorized',
        thumbnail: book.thumbnail || './images/default-book-cover.jpg',
        is_borrowed: false
      }));

      localStorage.setItem('books', JSON.stringify(books));
    } else {
      books = JSON.parse(storedBooks);
    }

    displayBooks();
  } catch (error) {
    console.error('Error loading books:', error);
    books = [];
    displayBooks();
  }
}

function saveBooks() {
  try {
    localStorage.setItem('books', JSON.stringify(books));;
  } catch (error) {
    console.error('Error saving books:', error);
    alert('Error saving books. Please try again.');
  }
}

function handlePageAction() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  const addBookSection = document.getElementById('add-book-section');
  const manageBooksSection = document.getElementById('manage-books-section');

  if (addBookSection) addBookSection.style.display = 'none';
  if (manageBooksSection) manageBooksSection.style.display = 'none';

  if (action === 'add') {
    if (addBookSection) {
      addBookSection.style.display = 'block';
    }
  } else if (action === 'manage') {
    if (manageBooksSection) {
      manageBooksSection.style.display = 'block';
      displayBooks();
    }
  }
  else {
    if (manageBooksSection) {
      manageBooksSection.style.display = 'block';
      displayBooks();
    }
  }

}

function initEventListeners() {
  const submitBtn = document.querySelector('.submit-btn');
  const toggleBtn = document.getElementById('toggleAddBook');
  const booksList = document.querySelector('.books-list');
  const statusToggleBtn = document.getElementById('statusToggle');

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentEditId) {
        updateBook();
      } else {
        addBook();
      }
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', handleToggleSection);
  }

  if (booksList) {
    booksList.addEventListener('click', handleBookActions);
  }

  if (statusToggleBtn) {
    statusToggleBtn.addEventListener('click', toggleBookStatus);
  }
}

function handleToggleSection() {
  const addSection = document.getElementById('add-book-section');
  const manageSection = document.getElementById('manage-books-section');
  const toggleBtn = document.getElementById('toggleAddBook');

  if (addSection.style.display === 'none') {
    addSection.style.display = 'block';
    manageSection.style.display = 'none';
    if (!currentEditId) {
      toggleBtn.innerHTML = '<i class="fas fa-list"></i> Show All Books';
      document.querySelector('#add-book-section h1').textContent = 'Add New Book';
      document.querySelector('.submit-btn').textContent = 'Add Book';
    }
  } else {
    showManageSection();
  }
}

function handleBookActions(e) {
  const target = e.target.closest('.edit-book-btn, .delete-book-btn');
  if (!target) return;

  const bookCard = target.closest('.book-card');
  if (!bookCard) return;

  const bookId = bookCard.dataset.bookId;
  if (!bookId) return;

  if (target.classList.contains('edit-book-btn')) {
    startEdit(bookId);
  }

  if (target.classList.contains('delete-book-btn')) {
    deleteBook(bookId);
  }
}
function toggleBookStatus() {
  const statusToggleBtn = document.getElementById('statusToggle');
  const isBorrowed = statusToggleBtn.classList.contains('borrowed');
  if (isBorrowed) {
    statusToggleBtn.classList.remove('borrowed');
    statusToggleBtn.innerHTML = '<i class="fas fa-circle-check"></i> Available';
  } else {
    statusToggleBtn.classList.add('borrowed');
    statusToggleBtn.innerHTML = '<i class="fas fa-circle-xmark"></i> Borrowed';
  }
}

function displayBooks() {
  const container = document.querySelector('.books-list');
  if (!container) return;

  container.innerHTML = books && books.length ?
    books.map(book => {
      const {
        id,
        title = 'Untitled',
        author = 'Unknown',
        description = 'No description available',
        categories = 'Uncategorized',
        thumbnail,
        is_borrowed = false
      } = book || {};

      return `
        <div class="book-card" data-book-id="${id}"> <!-- Keep ID in data attribute -->
          <div class="book-thumbnail">
            <img 
              src="${thumbnail || './images/default-book-cover.jpg'}" 
              alt="${title}" 
              class="book-image"
              onerror="this.src='./images/default-book-cover.jpg'"
            >
          </div>
          <div class="book-details">
            <h3>${title}</h3>
            <p class="author">By ${author}</p>
            <p class="categories">Categories: ${categories}</p>
            <p class="description">${description}</p>
            <p class="status ${is_borrowed ? 'borrowed' : 'available'}">
              <i class="fas fa-${is_borrowed ? 'circle-xmark' : 'circle-check'}"></i>
              ${is_borrowed ? 'Borrowed' : 'Available'}
            </p>
            <div class="book-actions">
              <button class="edit-book-btn">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="delete-book-btn">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('') :
    '<p class="no-books">No books added yet.</p>';
}

function validateBookInput(book) {
  const errors = [];
  if (!book.title || book.title.length < 2) errors.push("Title is too short");
  if (!book.author || book.author.length < 2) errors.push("Author name is too short");
  if (!book.description || book.description.length < 10) errors.push("Description is too short");
  if (!book.thumbnail) errors.push("Cover URL is required");
  return errors;
}

function addBook() {
  const book = getBookFormData();
  const validationErrors = validateBookInput(book);

  if (validationErrors.length > 0) {
    alert(validationErrors.join('\n'));
    return;
  }

  books.push(book);
  saveBooks();
  displayBooks();
  resetForm();
  alert('Book added successfully!');
}

function startEdit(bookId) {
  const book = books.find(b => b.id === bookId);

  if (!book) {
    console.error('Book not found:', bookId);
    return;
  }

  currentEditId = bookId;

  const addSection = document.getElementById('add-book-section');
  const manageSection = document.getElementById('manage-books-section');
  const toggleBtn = document.getElementById('toggleAddBook');
  const addBookTitle = document.querySelector('#add-book-section h1');
  const submitBtn = document.querySelector('.submit-btn');

  document.getElementById('title').value = book.title || '';
  document.getElementById('author').value = book.author || '';
  document.getElementById('description').value = book.description || '';
  document.getElementById('cover').value = book.thumbnail || '';

  const statusToggleBtn = document.getElementById('statusToggle');
  if (statusToggleBtn) {
    if (book.is_borrowed) {
      statusToggleBtn.classList.add('borrowed');
      statusToggleBtn.innerHTML = '<i class="fas fa-circle-xmark"></i> Borrowed';
    } else {
      statusToggleBtn.classList.remove('borrowed');
      statusToggleBtn.innerHTML = '<i class="fas fa-circle-check"></i> Available';
    }
  }

  if (addSection) addSection.style.display = 'block';
  if (manageSection) manageSection.style.display = 'none';
  if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Cancel Edit';
  if (addBookTitle) addBookTitle.textContent = 'Edit Book';
  if (submitBtn) submitBtn.textContent = 'Save Changes';

}

function updateBook() {
  const updatedBook = getBookFormData();
  updatedBook.id = currentEditId;

  const validationErrors = validateBookInput(updatedBook);
  if (validationErrors.length > 0) {
    alert(validationErrors.join('\n'));
    return;
  }

  const bookIndex = books.findIndex(b => b.id === currentEditId);
  if (bookIndex !== -1) {
    books[bookIndex] = {
      ...books[bookIndex], 
      ...updatedBook, 
      categories: updatedBook.categories || books[bookIndex].categories 
    };

    saveBooks();
    displayBooks();
    resetForm();
    showManageSection();
    alert('Book updated successfully!');
  } else {
    console.error('Book not found for update:', currentEditId);
    alert('Error updating book. Please try again.');
  }
}

function getBookFormData() {
  const statusToggleBtn = document.getElementById('statusToggle');
  const formData = {
    id: currentEditId || Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: document.getElementById('title').value.trim(),
    author: document.getElementById('author').value.trim(),
    description: document.getElementById('description').value.trim(),
    thumbnail: document.getElementById('cover').value.trim(),
    categories: document.getElementById('categories')?.value.trim() || '',
    is_borrowed: false
  };

  if (statusToggleBtn) {
    formData.is_borrowed = statusToggleBtn.classList.contains('borrowed');
  }

  return formData;
}

function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  books = books.filter(book => book.id !== id);
  saveBooks();
  displayBooks();
  alert('Book deleted successfully!');
}

function resetForm() {
  document.getElementById('title').value = '';
  document.getElementById('author').value = '';
  document.getElementById('description').value = '';
  document.getElementById('cover').value = '';

  const statusToggleBtn = document.getElementById('statusToggle');
  statusToggleBtn.classList.remove('borrowed');
  statusToggleBtn.innerHTML = '<i class="fas fa-circle-check"></i> Available';

  currentEditId = null;
}

function showManageSection() {
  const addSection = document.getElementById('add-book-section');
  const manageSection = document.getElementById('manage-books-section');
  const toggleBtn = document.getElementById('toggleAddBook');

  if (addSection) addSection.style.display = 'none';
  if (manageSection) manageSection.style.display = 'block';
  if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-plus"></i> Add New Book';

  currentEditId = null;
  resetForm();

  const addBookTitle = document.querySelector('#add-book-section h1');
  const submitBtn = document.querySelector('.submit-btn');

  if (addBookTitle) addBookTitle.textContent = 'Add New Book';
  if (submitBtn) submitBtn.textContent = 'Add Book';

  displayBooks();
}