from django.http import HttpResponsePermanentRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from .models import Book, UserProfile, BorrowRecord
from .forms import RegisterForm, BookForm, UserProfileForm

# Create your views here.

def index(request):
    books = Book.objects.filter(is_available=True).order_by('-id')[:6]
    return render(request, 'index.html', {'books': books})

def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            try:
                user = form.save(commit=False)
                user.email = form.cleaned_data['email']
                user.save()
                
                UserProfile.objects.create(user=user)
                
                user = authenticate(
                    username=form.cleaned_data['username'],
                    password=form.cleaned_data['password']
                )
                
                if user is not None:
                    auth_login(request, user)
                    return redirect('home')
                else:
                    return redirect('login')
                    
            except Exception as e:
                messages.error(request, f'An error occurred during registration: {str(e)}')
    else:
        form = RegisterForm()
    
    return render(request, 'register.html', {'form': form})

def login_view(request):
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('admin_page')
        else:
            return redirect('user_page')
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            auth_login(request, user)
            
            if user.is_staff:
                return redirect('admin_page')
            else:
                return redirect('user_page')
        else:
            messages.error(request, 'Invalid username or password.')
    
    return render(request, 'login.html')

def logout_view(request):
    auth_logout(request)
    return redirect('home')

@login_required
def user_page(request):
    user_profile = get_object_or_404(UserProfile, user=request.user)
    borrowed_books = user_profile.books_borrowed.all()
    return render(request, 'user_page.html', {
        'user_profile': user_profile,
        'borrowed_books': borrowed_books
    })

@login_required
def admin_page(request):
    if not request.user.is_staff:
        return redirect('home')
    return render(request, 'admin_page.html')

def books_list(request):
    query = request.GET.get('q', '')
    books = Book.objects.filter(
        title__icontains=query
    ).order_by('-title')
    
    import json
    from django.core.serializers.json import DjangoJSONEncoder
    
    books_data = [{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'description': book.description,
        'categories': book.genre,
        'thumbnail': book.cover_image.url if book.cover_image else '',
        'is_borrowed': not book.is_available
    } for book in books]
    
    books_json = json.dumps(books_data, cls=DjangoJSONEncoder)
    
    return render(request, 'books_list.html', {
        'books': books_json,
        'query': query
    })

@login_required
def manage_books(request):
    if not request.user.is_staff:
        return redirect('home')
    
    if request.method == 'POST':
        form = BookForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('manage_books')
    else:
        form = BookForm()
    
    books = Book.objects.all()
    return render(request, 'manage_book.html', {
        'form': form,
        'books': books
    })

@login_required
def edit_book(request, book_id):
    if not request.user.is_staff:
        return redirect('home')
    
    book = get_object_or_404(Book, id=book_id)
    
    if request.method == 'POST':
        form = BookForm(request.POST, request.FILES, instance=book)
        if form.is_valid():
            form.save()
            return redirect('manage_books')
    else:
        form = BookForm(instance=book)
    
    return render(request, 'edit_book.html', {
        'form': form,
        'book': book
    })

@login_required
def delete_book(request, book_id):
    if not request.user.is_staff:
        return redirect('home')
    
    book = get_object_or_404(Book, id=book_id)
    book.delete()
    return redirect('manage_books')

@login_required
def manage_users(request):
    if not request.user.is_staff:
        return redirect('index')
    users = User.objects.all()
    return render(request, 'manage_users.html', {'users': users})

@login_required
def toggle_admin(request, user_id):
    if not request.user.is_staff:
        return redirect('index')
    
    if request.method == 'POST':
        try:
            user_to_update = User.objects.get(id=user_id)
            is_being_promoted = not user_to_update.is_staff
            
            if is_being_promoted:
                try:
                    user_profile = UserProfile.objects.get(user=user_to_update)
                    borrowed_books = list(user_profile.books_borrowed.all())
                    
                    print(f"Found {len(borrowed_books)} borrowed books to return")
                    for book in borrowed_books:
                        print(f"Processing book: {book.id} - {book.title}, Current availability: {book.is_available}")
                        
                        book.is_available = True
                        book.save()
                        print(f"After save, book availability: {book.is_available}")
                        
                        user_profile.books_borrowed.remove(book)
                        
                        borrow_records = BorrowRecord.objects.filter(
                            user=user_to_update, 
                            book=book, 
                            return_date__isnull=True
                        )
                        print(f"Found {borrow_records.count()} borrow records to update")
                        for borrow_record in borrow_records:
                            borrow_record.return_date = timezone.now()
                            borrow_record.save()
                            
                        book.refresh_from_db()
                        print(f"Final book availability check: {book.is_available}")
                        
                        if not book.is_available:
                            Book.objects.filter(id=book.id).update(is_available=True)
                            
                    if borrowed_books:
                        messages.success(request, f"All borrowed books ({len(borrowed_books)}) have been returned as user is now an admin.")
                        
                except UserProfile.DoesNotExist:
                    pass 
            
            user_to_update.is_staff = is_being_promoted
            user_to_update.save()
            
        except User.DoesNotExist:
            messages.error(request, "User not found.")
    
    return redirect('manage_users')

def book_detail(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    return render(request, 'book.html', {'book': book})

@login_required
def borrow_book(request, book_id):
    if request.method == 'POST':
        book = get_object_or_404(Book, id=book_id)
        user_profile = get_object_or_404(UserProfile, user=request.user)
        
        if book.is_available:
            book.is_available = False
            book.save()
            
            user_profile.books_borrowed.add(book)
            BorrowRecord.objects.create(user=request.user, book=book)
            
        else:
            messages.error(request, 'This book is currently not available.')
        
        return redirect('user_page')

@login_required
def return_book(request, book_id):
    if request.method == 'POST':
        book = get_object_or_404(Book, id=book_id)
        user_profile = get_object_or_404(UserProfile, user=request.user)
        
        if book in user_profile.books_borrowed.all():
            book.is_available = True
            book.save()
            
            user_profile.books_borrowed.remove(book)
            
            borrow_records = BorrowRecord.objects.filter(user=request.user, book=book, return_date__isnull=True)
            for borrow_record in borrow_records:
                borrow_record.return_date = timezone.now()
                borrow_record.save()
            
        else:
            messages.error(request, 'This book is not in your borrowed list.')
        
        return redirect('user_page')

@login_required
def update_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    if not request.user.is_staff:
        return redirect('index')
    
    if request.method == 'POST':
        form = BookForm(request.POST, request.FILES, instance=book)
        if form.is_valid():
            form.save()
            return redirect('manage_books')
    else:
        form = BookForm(instance=book)
    
    return render(request, 'update_book.html', {
        'form': form,
        'book': book
    })

@login_required
def delete_book(request, book_id):
    if not request.user.is_staff:
        return redirect('index')
    
    book = get_object_or_404(Book, id=book_id)
    book.delete()
    return redirect('manage_books')

@login_required
def update_user(request, user_id):
    if not request.user.is_staff:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': False, 'error': 'Permission denied'}, status=403)
        return redirect('index')
    
    user = get_object_or_404(User, id=user_id)
    
    if request.method == 'POST':
        email = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        
        user.email = email
        user.first_name = first_name
        user.last_name = last_name
        user.save()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'message': 'User updated successfully'
            })
        
        return redirect('manage_users')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': False,
            'error': 'GET method not supported for this endpoint'
        })
    
    return render(request, 'update_user.html', {'user': user})

@login_required
def update_profile(request):
    user_profile = get_object_or_404(UserProfile, user=request.user)
    
    if request.method == 'POST':
        user = request.user
        user.first_name = request.POST.get('first_name', '')
        user.last_name = request.POST.get('last_name', '')
        user.email = request.POST.get('email', '')
        user.save()
        
        if 'avatar' in request.FILES and request.FILES['avatar']:
            user_profile.avatar = request.FILES['avatar']
            user_profile.save()
        else:
            user_profile.save()
            
        return redirect('user_page')
    
    return redirect('user_page')

def search_books(request):
    query = request.GET.get('q', '')
    books = Book.objects.filter(
        title__icontains=query
    )
    return render(request, 'books_list.html', {
        'books': books,
        'query': query
    })

@login_required
def borrowed_books(request):
    user_profile = get_object_or_404(UserProfile, user=request.user)
    
    borrowed_books = user_profile.books_borrowed.all()
    
    import json
    from django.core.serializers.json import DjangoJSONEncoder
    
    books_data = [{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'description': book.description,
        'categories': book.genre,
        'thumbnail': book.cover_image.url if book.cover_image else '',
        'is_borrowed': not book.is_available
    } for book in borrowed_books]
    
    books_json = json.dumps(books_data, cls=DjangoJSONEncoder)
    
    return render(request, 'borrowed_books.html', {
        'books': books_json,
    })

