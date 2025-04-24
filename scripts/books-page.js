const booksPerPage = 12;
let currentPage = 1;
let books = [];
let originalBooks = [];

document.addEventListener('DOMContentLoaded', loadBooks);
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchBooks(e.target.value.trim());
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

        originalBooks = [...books];

        displayBooks();
        updatePaginationButtons();

    } catch (error) {
        console.error('Error loading books:', error);
        console.log('Response:', error.response);
        books = [];
        originalBooks = [];
        displayBooks();
        updatePaginationButtons();
    }
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

        const categoriesArray = typeof book.categories === 'string'
            ? book.categories.split(', ')
            : Array.isArray(book.categories)
                ? book.categories
                : [];

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
                <p class="book-authors">${book.author || 'Unknown Author'}</p>
                <div class="book-categories">
                    ${categoriesArray.length > 0
                ? categoriesArray.map(cat => `<span class="category-tag">${cat}</span>`).join('')
                : '<span class="category-tag">Uncategorized</span>'}
                </div>
                <span class="book-status ${book.is_borrowed ? 'borrowed' : 'available'}">
                    ${book.is_borrowed ? 'Borrowed' : 'Available'}
                </span>
            </div>
        `;

        booksGrid.appendChild(bookCard);
    });

    document.getElementById('currentPage').textContent = currentPage;
    updatePaginationButtons();
}

function searchBooks(query) {
    if (!query) {
        books = [...originalBooks];
        currentPage = 1;
        displayBooks();
        updatePaginationButtons();
        return;
    }

    query = query.toLowerCase();
    const filteredBooks = originalBooks.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(query);
        const authorMatch = book.author.toLowerCase().includes(query);

        const categoriesMatch = typeof book.categories === 'string'
            ? book.categories.toLowerCase().includes(query)
            : Array.isArray(book.categories) && book.categories.some(category =>
                category.toLowerCase().includes(query));

        return titleMatch || authorMatch || categoriesMatch;
    });

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