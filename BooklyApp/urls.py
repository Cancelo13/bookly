from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('user/', views.user_page, name='user_page'),
    path('admin/', views.admin_page, name='admin_page'),
    path('books/', views.books_list, name='books_list'),
    path('books/search/', views.search_books, name='search_books'),
    path('books/borrowed/', views.borrowed_books, name='borrowed_books'),
    path('manage/books/', views.manage_books, name='manage_books'),
    path('manage/users/', views.manage_users, name='manage_users'),
    path('book/<int:book_id>/', views.book_detail, name='book_detail'),
    path('book/<int:book_id>/borrow/', views.borrow_book, name='borrow_book'),
    path('book/<int:book_id>/return/', views.return_book, name='return_book'),
    path('book/<int:book_id>/update/', views.update_book, name='update_book'),
    path('book/<int:book_id>/edit/', views.edit_book, name='edit_book'),
    path('book/<int:book_id>/delete/', views.delete_book, name='delete_book'),
    path('user/<int:user_id>/update/', views.update_user, name='update_user'),
    path('user/profile/update/', views.update_profile, name='update_profile'),
    path('user/<int:user_id>/toggle-admin/', views.toggle_admin, name='toggle_admin'),
]