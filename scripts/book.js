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
        .catch(error => console.error('Error loading book details:', error));
});

function displayBookDetails(book) {
    document.getElementById('bookCover').src = book.thumbnail || 'images/default-book.jpg';
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