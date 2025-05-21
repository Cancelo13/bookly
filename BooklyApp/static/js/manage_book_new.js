document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  const addSection = document.getElementById('add-book-section');
  const manageSection = document.getElementById('manage-books-section');
  
  if (addSection && manageSection) {
    addSection.style.display = 'none';
    manageSection.style.display = 'none';
    
    if (action === 'add') {
      addSection.style.display = 'block';
    } else if (action === 'manage') {
      manageSection.style.display = 'block';
    } else {
      manageSection.style.display = 'block';
    }
  }
  const deleteButtons = document.querySelectorAll('.delete-btn');
  if (deleteButtons && deleteButtons.length > 0) {
    deleteButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        if (!confirm('Are you sure you want to delete this book?')) {
          e.preventDefault();
        }
      });
    });
  }
  
  const bookRows = document.querySelectorAll('.books-table tbody tr');
  if (bookRows && bookRows.length > 0) {
    bookRows.forEach(function(row) {
      row.addEventListener('mouseenter', function() {
        row.classList.add('highlight');
      });
      row.addEventListener('mouseleave', function() {
        row.classList.remove('highlight');
      });
    });
  }
});
