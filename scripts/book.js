document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('id');

    if (!bookTitle) {
        window.location.href = 'books_list.html';
        return;
    }

    fetch('../Data/books.json')
        .then(response => response.json())
        .then(books => {
            const book = books.find(b => b.title === decodeURIComponent(bookTitle));
            if (book) {
                displayBookDetails(book);
            } else {
                window.location.href = 'books_list.html';
            }
        })
        .catch(error => {
            console.error('Error loading book details:', error);
        });
});

function displayBookDetails(book) {
    // Set book cover
    const coverImg = document.getElementById('bookCover');
    coverImg.src = book.thumbnail || 'images/default-book.jpg';
    coverImg.alt = book.title;

    // Set book title
    document.getElementById('bookTitle').textContent = book.title;

    // Set authors
    document.getElementById('bookAuthors').textContent = 
        book.authors ? `By ${book.authors.join(', ')}` : 'Unknown Author';

    // Set categories
    const categoriesContainer = document.getElementById('bookCategories');
    if (book.categories && book.categories.length > 0) {
        categoriesContainer.innerHTML = book.categories
            .map(category => `<span class="category-tag">${category}</span>`)
            .join('');
    }

    // Set description
    document.getElementById('bookDescription').textContent = 
        book.description || 'No description available.';
}