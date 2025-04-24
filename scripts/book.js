let books = [];
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('id');

    if (!bookTitle) {
        window.location.href = 'books_list.html';
        return;
    }
    loadBooks();
    const book = books.find(b => b.title === decodeURIComponent(bookTitle));
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
    document.getElementById('bookAuthors').textContent =
        book.authors ? `By ${book.authors.join(', ')}` : 'Unknown Author';

    const categoriesContainer = document.getElementById('bookCategories');
    categoriesContainer.innerHTML = book.categories
        ? book.categories.map(category => `<span class="category-tag">${category}</span>`).join('')
        : '';

    document.getElementById('bookDescription').textContent =
        book.description || 'No description available.';
}

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
  
    } catch (error) {
      console.error('Error loading books:', error);
      books = [];
    }
  }