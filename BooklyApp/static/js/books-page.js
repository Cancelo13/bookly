const booksPerPage = 12;
let currentPage = 1;
let books = [];
let originalBooks = [];

document.addEventListener('DOMContentLoaded', () => {
    try {
        const booksData = document.getElementById('books-data');
        if (booksData) {
            books = JSON.parse(booksData.textContent);
            originalBooks = [...books];
            displayBooks();
            updatePaginationButtons();
        } else {
            console.error('Books data element not found');
        }
    } catch (error) {
        console.error('Error initializing books:', error);
        books = [];
        displayBooks();
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchBooks(e.target.value.trim());
        });
    }
});

function displayBooks() {
    const booksGrid = document.getElementById('booksGrid');
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const currentBooks = books.slice(startIndex, endIndex);

    booksGrid.innerHTML = '';

    currentBooks.forEach(book => {
        const bookCard = document.createElement('a');
        bookCard.href = `/book/${book.id}/`;
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