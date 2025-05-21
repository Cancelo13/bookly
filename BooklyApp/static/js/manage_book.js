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
      document.title = 'Add Book - Bookly';
    } else if (action === 'manage') {
      manageSection.style.display = 'block';
      document.title = 'Manage Books - Bookly';
    } else {
      manageSection.style.display = 'block';
      document.title = 'Manage Books - Bookly';
    }
  }
  
  const deleteButtons = document.querySelectorAll('.delete-book-btn');
  if (deleteButtons.length > 0) {
    deleteButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        if (!confirm('Are you sure you want to delete this book?')) {
          e.preventDefault();
        }
      });
    });
  }
  
  const bookCards = document.querySelectorAll('.book-card');
  if (bookCards.length > 0) {
    bookCards.forEach(function(card, index) {
      card.style.animationDelay = (index * 0.05) + 's';
    });
  }
  
  const messages = document.querySelector('.messages');
  if (messages) {
    setTimeout(function() {
      messages.style.opacity = '0';
      setTimeout(function() {
        messages.style.display = 'none';
      }, 500);
    }, 5000);
  }
  
  const availabilityCheckbox = document.querySelector('.availability-checkbox');
  if (availabilityCheckbox) {
    const toggleText = document.querySelector('.toggle-text');
    updateToggleText();
    
    availabilityCheckbox.addEventListener('change', updateToggleText);
    
    function updateToggleText() {
      if (availabilityCheckbox.checked) {
        toggleText.textContent = 'Available';
        toggleText.style.color = '#10b981';
      } else {
        toggleText.textContent = 'Borrowed';
        toggleText.style.color = '#ef4444';
      }
    }
  }
});