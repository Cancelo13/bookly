let books = [];
let book;
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookTitle = urlParams.get('id');

  if (!bookTitle) {
    window.location.href = 'books_list.html';
    return;
  }
  loadBooks();
  book = books.find(b => b.title === decodeURIComponent(bookTitle));
  if (book) {
    displayBookDetails(book);
  } else {
    window.location.href = 'books_list.html';
  }
});

function displayBookDetails(book) {
  document.getElementById('bookCover').src = book.thumbnail || 'images/default-book-cover.jpg';
  document.getElementById('bookCover').alt = book.title;
  document.getElementById('bookTitle').textContent = book.title;
  document.getElementById('bookStatus').textContent = book.is_borrowed ?
    'Borrowed' : 'Available';

  document.getElementById('bookAuthors').textContent =
    book.author ? `By ${book.author}` : 'Unknown Author';

  const categoriesContainer = document.getElementById('bookCategories');
  const categoriesArray = typeof book.categories === 'string'
    ? book.categories.split(', ')
    : Array.isArray(book.categories)
      ? book.categories
      : [];
  if (categoriesArray.length > 0) {
    categoriesContainer.innerHTML = categoriesArray.map(category => `<span class="category-tag">${category}</span>`).join('');
  }
  else {
    categoriesContainer.innerHTML = '<span class="category-tag">Uncategorized</span>';
  }
  document.getElementById('bookDescription').textContent =
    book.description || 'No description available.';
  if (book.is_borrowed) {
    document.getElementById('borrowBtn').style.display = 'none';
  }
}

async function loadBooks() {
  try {
    const storedBooks = localStorage.getItem('books');

    if (!storedBooks || JSON.parse(storedBooks).length === 0) {
      const jsonBooks = window.booksData || [];

      books = jsonBooks.map(book => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: book.title || 'Untitled',
        author: Array.isArray(book.author) && book.author.length > 0
          ? book.author.join(', ')
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

  } catch (error) {
    console.error('Error loading books:', error);
    books = [];
  }
}

document.getElementById('borrowBtn').addEventListener('click', () => {
  const currentUserName = localStorage.getItem('currentUser');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const currentUser = users.find(user => user.username.toLowerCase() === currentUserName.toLowerCase() || user.name.toLowerCase() === currentUserName.toLowerCase());

  if (currentUser) {
    const borrowedBooks = currentUser.borrowedBooks || [];
    borrowedBooks.push(book.title);
    currentUser.borrowedBooks = borrowedBooks;
    book.is_borrowed = true;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('books', JSON.stringify(books));
    document.getElementById('bookStatus').textContent = 'Borrowed';
    document.getElementById('borrowBtn').style.display = 'none';
    alert('Book borrowed successfully!');
  }
  else {
    alert('Please log in to borrow books.');
  }
});