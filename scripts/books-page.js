const booksPerPage = 12;
let currentPage = 1;
let books = [];

// Load books when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
});

function loadBooks() {
    fetch('../Data/books.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            books = data.filter(book => book && book.title && book.thumbnail);
            console.log('Books loaded:', books.length);
            displayBooks();
            updatePaginationButtons();
        })
        .catch(error => {
            console.error('Error loading books:', error);
            document.getElementById('booksGrid').innerHTML =
                `<p style="color: var(--fourth-color); text-align: center;">
                    Error loading books: ${error.message}
                </p>`;
        });
}

function displayBooks() {
    const booksGrid = document.getElementById('booksGrid');
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const currentBooks = books.slice(startIndex, endIndex);
    
    booksGrid.innerHTML = '';

    currentBooks.forEach(book => {
        const bookCard = document.createElement('a');
        bookCard.href = `book-details.html?id=${encodeURIComponent(book.title)}`;
        bookCard.className = 'book-card';

        const defaultImage = '../images/default-book.jpg';
        const highResImage = book.thumbnail ? book.thumbnail.replace('zoom=1', 'zoom=2') : defaultImage;

        bookCard.innerHTML = `
            <img src="${highResImage}" 
                 alt="${book.title}" 
                 class="book-thumbnail"
                 loading="lazy"
                 onerror="this.src='${defaultImage}'; this.onerror=null;"
                 onload="this.style.opacity='1'">
            <h3 class="book-title">${book.title}</h3>
            <div class="book-info">
                <p class="book-authors">${book.authors ? book.authors.join(', ') : 'Unknown Author'}</p>
                <span class="book-status">Available</span>
            </div>
        `;

        booksGrid.appendChild(bookCard);
    });

    document.getElementById('currentPage').textContent = currentPage;
}

function updatePaginationButtons() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const totalPages = Math.ceil(books.length / booksPerPage);

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayBooks();
        updatePaginationButtons();
    }
}

function nextPage() {
    const totalPages = Math.ceil(books.length / booksPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayBooks();
        updatePaginationButtons();
    }
}