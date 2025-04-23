const booksPerPage = 12;
let currentPage = 1;
let books = [];
let originalBooks = [];

document.addEventListener('DOMContentLoaded', loadBooks);
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchBooks(e.target.value.trim());
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
            originalBooks = data.filter(book => book && book.title && book.thumbnail);
            books = [...originalBooks]; // Create a copy
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
        bookCard.href = `book.html?id=${encodeURIComponent(book.title)}`;
        bookCard.className = 'book-card';

        if (localStorage.getItem(`visited-${book.title}`)) {
            bookCard.setAttribute('data-visited', 'true');
        }

        bookCard.addEventListener('click', () => {
            localStorage.setItem(`visited-${book.title}`, 'true');
            bookCard.setAttribute('data-visited', 'true');
        });

        const defaultImage = '../images/default-book.jpg';
        const highResImage = book.thumbnail
            ? book.thumbnail
                .replace('zoom=1', 'zoom=2')
                .replace('edge=curl', 'edge=none')
                .replace('&source=gbs_api', '&source=gbs_api&fife=w400-h600')
            : defaultImage;

        bookCard.innerHTML = `
            <div class="book-image-container">
                <img src="${highResImage}" 
                     alt="${book.title}" 
                     class="book-thumbnail"
                     loading="lazy"
                     onerror="this.src='${defaultImage}'; this.classList.add('fallback-image')"
                     onload="this.classList.add('loaded')">
            </div>
            <div class="book-info">
                <h3 class="book-title" style="color: #F5EFE7">${book.title}</h3>
                <p class="book-authors">${book.authors ? book.authors.join(', ') : 'Unknown Author'}</p>
                <div class="book-categories">
                    ${book.categories ? book.categories.map(cat =>
            `<span class="category-tag">${cat}</span>`).join('') : ''}
                </div>
                <span class="book-status">Available</span>
            </div>
        `;

        booksGrid.appendChild(bookCard);
    });

    document.getElementById('currentPage').textContent = currentPage;
}

function searchBooks(query) {
    if (!query) {
        books = [...originalBooks];
        currentPage = 1;
        displayBooks();
        updatePaginationButtons();
        return;
    }

    const filteredBooks = originalBooks.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        (book.authors && book.authors.some(author =>
            author.toLowerCase().includes(query.toLowerCase()))) ||
        (book.categories && book.categories.some(category =>
            category.toLowerCase().includes(query.toLowerCase())))
    );

    books = filteredBooks;
    currentPage = 1;
    displayBooks();
    updatePaginationButtons();
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