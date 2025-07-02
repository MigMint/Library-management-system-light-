// Global variables
let currentUser = null;
let currentUserProfile = null;
let html5QrcodeScanner = null;

// Language translations
const translations = {
    en: {
        // Auth
        login_title: "Library Management System",
        register_title: "Create Account",
        login_btn: "Login",
        register_btn: "Register",
        logout_btn: "Logout",
        no_account: "Don't have an account?",
        have_account: "Already have an account?",
        register_link: "Register",
        login_link: "Login",
        
        // Navigation
        library_title: "Library Management System",
        nav_books: "Books",
        nav_borrow: "Borrow/Return",
        nav_manage: "Manage Books",
        nav_users: "Users",
        nav_rules: "Rules",
        nav_profile: "Profile",
        
        // Books
        books_title: "Library Books",
        add_book: "Add New Book",
        existing_books: "Existing Books",
        manage_books_title: "Manage Books",
        add_book_btn: "Add Book",
        print_barcode: "Print Barcode",
        
        // Borrow/Return
        borrow_title: "Borrow & Return Books",
        scan_barcode: "Scan Book Barcode",
        start_scan: "Start Scanner",
        stop_scan: "Stop Scanner",
        manual_entry: "Or Enter Book ID Manually",
        process_btn: "Process",
        transaction_history: "Transaction History",
        
        // Users
        users_title: "Manage Users",
        role_user: "User",
        role_staff: "Staff",
        
        // Profile
        profile_title: "My Profile",
        name_label: "Name",
        email_label: "Email",
        role_label: "Role",
        member_since: "Member Since",
        my_borrowed_books: "My Borrowed Books",
        
        // Rules
        rules_title: "Library Rules & Regulations",
        rules_content: `
            <h3>Terms & Conditions</h3>
            <ol>
                <li>Books must be returned within 14 days from the date of borrowing.</li>
                <li>Late returns will incur a fine of RM 1.00 per day.</li>
                <li>Maximum of 3 books can be borrowed at one time.</li>
                <li>Lost or damaged books must be replaced or paid for.</li>
                <li>Reference books cannot be borrowed.</li>
                <li>Library card must be presented when borrowing books.</li>
                <li>Silence must be maintained in the library.</li>
                <li>Food and drinks are not allowed in the library.</li>
                <li>Books must be handled with care.</li>
                <li>Violation of rules may result in suspension of library privileges.</li>
            </ol>
        `
    },
    ms: {
        // Auth
        login_title: "Sistem Pengurusan Perpustakaan",
        register_title: "Cipta Akaun",
        login_btn: "Log Masuk",
        register_btn: "Daftar",
        logout_btn: "Log Keluar",
        no_account: "Tiada akaun?",
        have_account: "Sudah ada akaun?",
        register_link: "Daftar",
        login_link: "Log Masuk",
        
        // Navigation
        library_title: "Sistem Pengurusan Perpustakaan",
        nav_books: "Buku",
        nav_borrow: "Pinjam/Pulang",
        nav_manage: "Urus Buku",
        nav_users: "Pengguna",
        nav_rules: "Peraturan",
        nav_profile: "Profil",
        
        // Books
        books_title: "Buku Perpustakaan",
        add_book: "Tambah Buku Baru",
        existing_books: "Buku Sedia Ada",
        manage_books_title: "Urus Buku",
        add_book_btn: "Tambah Buku",
        print_barcode: "Cetak Kod Bar",
        
        // Borrow/Return
        borrow_title: "Pinjam & Pulangkan Buku",
        scan_barcode: "Imbas Kod Bar Buku",
        start_scan: "Mula Imbasan",
        stop_scan: "Henti Imbasan",
        manual_entry: "Atau Masukkan ID Buku Secara Manual",
        process_btn: "Proses",
        transaction_history: "Sejarah Transaksi",
        
        // Users
        users_title: "Urus Pengguna",
        role_user: "Pengguna",
        role_staff: "Kakitangan",
        
        // Profile
        profile_title: "Profil Saya",
        name_label: "Nama",
        email_label: "E-mel",
        role_label: "Peranan",
        member_since: "Ahli Sejak",
        my_borrowed_books: "Buku Pinjaman Saya",
        
        // Rules
        rules_title: "Peraturan & Undang-undang Perpustakaan",
        rules_content: `
            <h3>Terma & Syarat</h3>
            <ol>
                <li>Buku mesti dipulangkan dalam tempoh 14 hari dari tarikh peminjaman.</li>
                <li>Pemulangan lewat akan dikenakan denda RM 1.00 sehari.</li>
                <li>Maksimum 3 buah buku boleh dipinjam pada satu masa.</li>
                <li>Buku yang hilang atau rosak mesti diganti atau dibayar.</li>
                <li>Buku rujukan tidak boleh dipinjam.</li>
                <li>Kad perpustakaan mesti ditunjukkan semasa meminjam buku.</li>
                <li>Kesunyian mesti dijaga di dalam perpustakaan.</li>
                <li>Makanan dan minuman tidak dibenarkan di dalam perpustakaan.</li>
                <li>Buku mesti dikendalikan dengan berhati-hati.</li>
                <li>Pelanggaran peraturan boleh mengakibatkan penggantungan keistimewaan perpustakaan.</li>
            </ol>
        `
    }
};

let currentLanguage = 'en';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Define switchLanguage globally first
    window.switchLanguage = switchLanguage;
    
    // Check authentication state
    auth.onAuthStateChanged(async (user) => {
        showLoading(true);
        if (user) {
            currentUser = user;
            console.log('User logged in:', user.email);
            
            // Get user profile from database
            currentUserProfile = await getUserProfile(user.uid);
            console.log('User profile:', currentUserProfile);
            
            if (currentUserProfile) {
                showDashboard();
            } else {
                // If profile doesn't exist, user might have been created outside the app
                alert('User profile not found. Please contact admin.');
                await logoutUser();
                showLogin();
            }
        } else {
            currentUser = null;
            currentUserProfile = null;
            showLogin();
        }
        showLoading(false);
    });

    // Set up form handlers
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('addBookForm').addEventListener('submit', handleAddBook);
});

// Language switching
function switchLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    updatePageLanguage();
}

function updatePageLanguage() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[currentLanguage][key];
            } else {
                element.innerHTML = translations[currentLanguage][key];
            }
        }
    });
}

// Authentication handlers
async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = await loginUser(email, password);
    
    if (result.success) {
        document.getElementById('loginForm').reset();
    } else {
        alert('Login failed: ' + result.error);
    }
    
    showLoading(false);
}

async function handleRegister(e) {
    e.preventDefault();
    showLoading(true);
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    console.log('Attempting registration for:', email, name, role);
    
    const result = await registerUser(email, password, name, role);
    
    console.log('Registration result:', result);
    
    if (result.success) {
        document.getElementById('registerForm').reset();
        showLogin();
        alert('Registration successful! Please login.');
    } else {
        alert('Registration failed: ' + result.error);
    }
    
    showLoading(false);
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showLoading(true);
        await logoutUser();
        showLoading(false);
    }
}

// UI Navigation
function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'flex';
    document.getElementById('dashboardSection').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    
    // Update profile info
    document.getElementById('profileName').textContent = currentUserProfile.name;
    document.getElementById('profileEmail').textContent = currentUserProfile.email;
    document.getElementById('profileRole').textContent = currentUserProfile.role;
    document.getElementById('profileJoinDate').textContent = new Date(currentUserProfile.joinDate).toLocaleDateString();
    
    // Show/hide staff-only features
    const isStaff = currentUserProfile.role === 'staff';
    document.getElementById('manageLink').style.display = isStaff ? 'inline-block' : 'none';
    document.getElementById('usersLink').style.display = isStaff ? 'inline-block' : 'none';
    
    // Load initial data
    showSection('books');
    loadBooks();
    loadUserBorrowedBooks();
    
    // Set up real-time listeners
    listenToBooks(displayBooks);
    listenToTransactions(displayTransactions);
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(section + 'Section').style.display = 'block';
    
    // Load section-specific data
    switch(section) {
        case 'books':
            loadBooks();
            break;
        case 'manage':
            loadManageBooks();
            break;
        case 'users':
            loadUsers();
            break;
        case 'borrow':
            loadTransactions();
            break;
    }
}

// Book Management
async function handleAddBook(e) {
    e.preventDefault();
    showLoading(true);
    
    const bookData = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        isbn: document.getElementById('bookISBN').value,
        quantity: parseInt(document.getElementById('bookQuantity').value),
        category: document.getElementById('bookCategory').value,
        description: document.getElementById('bookDescription').value
    };
    
    const result = await addBook(bookData);
    
    if (result.success) {
        document.getElementById('addBookForm').reset();
        alert('Book added successfully!');
    } else {
        alert('Failed to add book: ' + result.error);
    }
    
    showLoading(false);
}

async function loadBooks() {
    const books = await getBooks();
    displayBooks(books);
}

function displayBooks(books) {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.onclick = () => showBookDetails(book);
        
        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Category:</strong> ${book.category}</p>
            <div class="book-status ${book.available ? 'status-available' : 'status-borrowed'}">
                ${book.available ? 'Available' : 'Borrowed'}
            </div>
        `;
        
        booksList.appendChild(bookCard);
    });
}

async function loadManageBooks() {
    const books = await getBooks();
    const manageBooksGrid = document.getElementById('manageBooksGrid');
    manageBooksGrid.innerHTML = '';
    
    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-card';
        
        bookItem.innerHTML = `
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Quantity:</strong> ${book.quantity}</p>
            <p><strong>Status:</strong> ${book.available ? 'Available' : 'Borrowed'}</p>
            <div style="margin-top: 10px;">
                <button class="action-btn view-btn" onclick="showBookDetails('${book.id}')">View</button>
                <button class="action-btn edit-btn" onclick="editBook('${book.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteBookConfirm('${book.id}')">Delete</button>
            </div>
        `;
        
        manageBooksGrid.appendChild(bookItem);
    });
}

// Book Details Modal
async function showBookDetails(bookOrId) {
    let book;
    if (typeof bookOrId === 'string') {
        book = await getBook(bookOrId);
    } else {
        book = bookOrId;
    }
    
    const modal = document.getElementById('bookModal');
    document.getElementById('modalBookTitle').textContent = book.title;
    
    const detailsHtml = `
        <p><strong>Book Code:</strong> <span id="bookCode" style="font-family: monospace; background: #f0f0f0; padding: 5px; border-radius: 3px;">${book.id}</span> 
        <button onclick="copyBookCode('${book.id}')" style="margin-left: 10px; padding: 5px 10px; background: var(--secondary-color); color: white; border: none; border-radius: 3px; cursor: pointer;">Copy Code</button></p>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>ISBN:</strong> ${book.isbn}</p>
        <p><strong>Category:</strong> ${book.category}</p>
        <p><strong>Description:</strong> ${book.description || 'No description available'}</p>
        <p><strong>Status:</strong> ${book.available ? 'Available' : 'Borrowed'}</p>
        ${book.borrowedBy ? `<p><strong>Borrowed by:</strong> ${book.borrowedBy}</p>` : ''}
        ${book.returnDate ? `<p><strong>Return Date:</strong> ${new Date(book.returnDate).toLocaleDateString()}</p>` : ''}
    `;
    
    document.getElementById('modalBookDetails').innerHTML = detailsHtml;
    
    // Generate barcode
    const barcodeData = generateBarcodeData(book.id);
    JsBarcode("#barcodeCanvas", barcodeData, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true
    });
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('bookModal').style.display = 'none';
}

function printBarcode() {
    window.print();
}

// Search functionality
function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// Barcode Scanner
function startScanner() {
    const reader = document.getElementById('reader');
    reader.style.display = 'block';
    document.getElementById('startScanBtn').style.display = 'none';
    document.getElementById('stopScanBtn').style.display = 'inline-block';
    
    html5QrcodeScanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA, Html5QrcodeScanType.SCAN_TYPE_FILE]
    });
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().then(() => {
            document.getElementById('reader').style.display = 'none';
            document.getElementById('startScanBtn').style.display = 'inline-block';
            document.getElementById('stopScanBtn').style.display = 'none';
        }).catch(error => {
            console.error('Failed to clear scanner', error);
        });
    }
}

async function onScanSuccess(decodedText, decodedResult) {
    console.log('Scan successful:', decodedText);
    // Stop scanner first
    await stopScanner();
    // Process the scanned code
    await processBookTransaction(decodedText);
}

function onScanFailure(error) {
    // Silently handle scan failures
}

async function processManualEntry() {
    const bookId = document.getElementById('manualBookId').value;
    if (bookId) {
        await processBookTransaction(bookId);
        document.getElementById('manualBookId').value = '';
    }
}

async function processBookTransaction(bookId) {
    showLoading(true);
    
    console.log('Processing book ID:', bookId); // Debug log
    
    // Try to find book with different ID formats
    let book = await getBook(bookId);
    
    // If not found and starts with LIB, try without prefix
    if (!book && bookId.startsWith('LIB')) {
        const shortId = bookId.substring(3);
        console.log('Trying without LIB prefix:', shortId);
        
        // Try to find book by searching through all books
        const allBooks = await getBooks();
        book = allBooks.find(b => 
            b.id === bookId || 
            b.id === shortId ||
            b.id.toUpperCase().includes(shortId) ||
            generateBarcodeData(b.id) === bookId
        );
    }
    
    console.log('Book found:', book); // Debug log
    
    if (!book) {
        alert('Book not found! Scanned ID: ' + bookId + '\nPlease check if this book exists in the system.');
        showLoading(false);
        return;
    }
    
    if (book.available) {
        // Borrow book
        const today = new Date();
        const defaultReturn = new Date();
        defaultReturn.setDate(today.getDate() + 14); // 14 days loan period
        
        // Create a custom date picker dialog
        const dateDialog = document.createElement('div');
        dateDialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
        `;
        
        dateDialog.innerHTML = `
            <h3 style="margin-bottom: 20px;">Select Return Date</h3>
            <p style="margin-bottom: 10px; color: #666;">Borrowing: "${book.title}"</p>
            <p style="margin-bottom: 20px; color: #666;">Default loan period: 14 days</p>
            <input type="date" id="returnDatePicker" 
                   min="${today.toISOString().split('T')[0]}" 
                   value="${defaultReturn.toISOString().split('T')[0]}"
                   style="padding: 10px; font-size: 16px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px;">
            <div>
                <button onclick="window.confirmBorrow('${bookId}')" style="padding: 10px 20px; background: var(--success-color); color: white; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">Confirm</button>
                <button onclick="window.cancelBorrow()" style="padding: 10px 20px; background: var(--danger-color); color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
            </div>
        `;
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'dateDialogBackdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;
        
        document.body.appendChild(backdrop);
        document.body.appendChild(dateDialog);
        
        showLoading(false);
    } else {
        // Return book
        if (book.borrowedBy === currentUser.uid || currentUserProfile.role === 'staff') {
            const result = await returnBook(bookId, book.borrowedBy);
            if (result.success) {
                alert(`Book "${book.title}" returned successfully!`);
            } else {
                alert('Failed to return book: ' + result.error);
            }
        } else {
            alert('You cannot return this book as it was not borrowed by you.');
        }
        showLoading(false);
    }
}

// Transaction History
async function loadTransactions() {
    const transactions = await getTransactions();
    displayTransactions(transactions);
}

function displayTransactions(transactions) {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';
    
    transactions.forEach(async (transaction) => {
        const book = await getBook(transaction.bookId);
        const user = await getUserProfile(transaction.userId);
        
        const transactionItem = document.createElement('div');
        transactionItem.className = `transaction-item ${transaction.type}`;
        
        transactionItem.innerHTML = `
            <div>
                <strong>${transaction.type === 'borrow' ? 'Borrowed' : 'Returned'}:</strong> ${book?.title || 'Unknown Book'}
                <br>
                <small>By: ${user?.name || 'Unknown User'} | Date: ${new Date(transaction.date).toLocaleString()}</small>
                ${transaction.returnDate ? `<br><small>Return by: ${new Date(transaction.returnDate).toLocaleDateString()}</small>` : ''}
            </div>
        `;
        
        transactionList.appendChild(transactionItem);
    });
}

// User Management (Staff only)
async function loadUsers() {
    if (currentUserProfile.role !== 'staff') return;
    
    const users = await getAllUsers();
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        userItem.innerHTML = `
            <div>
                <strong>${user.name}</strong>
                <br>
                <small>${user.email}</small>
            </div>
            <div>
                <span class="user-role role-${user.role}">${user.role}</span>
                ${user.id !== currentUser.uid ? `
                    <button class="action-btn edit-btn" onclick="changeUserRole('${user.id}', '${user.role}')">Change Role</button>
                ` : ''}
            </div>
        `;
        
        usersList.appendChild(userItem);
    });
}

async function changeUserRole(userId, currentRole) {
    const newRole = currentRole === 'staff' ? 'user' : 'staff';
    if (confirm(`Change user role to ${newRole}?`)) {
        showLoading(true);
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
            alert('User role updated successfully!');
            loadUsers();
        } else {
            alert('Failed to update user role: ' + result.error);
        }
        showLoading(false);
    }
}

// User Borrowed Books
async function loadUserBorrowedBooks() {
    const myBorrowedBooks = document.getElementById('myBorrowedBooks');
    myBorrowedBooks.innerHTML = '';
    
    const borrowedBooks = currentUserProfile.borrowedBooks || [];
    
    if (borrowedBooks.length === 0) {
        myBorrowedBooks.innerHTML = '<p>No borrowed books</p>';
        return;
    }
    
    for (const borrowed of borrowedBooks) {
        const book = await getBook(borrowed.bookId);
        const returnDate = new Date(borrowed.returnDate);
        const today = new Date();
        const daysLeft = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
        
        const bookItem = document.createElement('div');
        bookItem.className = 'borrowed-book-item';
        
        if (daysLeft < 0) {
            bookItem.classList.add('overdue');
        } else if (daysLeft <= 3) {
            bookItem.classList.add('due-soon');
        }
        
        bookItem.innerHTML = `
            <div>
                <strong>${book?.title || 'Unknown Book'}</strong>
                <br>
                <small>Borrowed: ${new Date(borrowed.borrowedDate).toLocaleDateString()}</small>
                <br>
                <small>Return by: ${returnDate.toLocaleDateString()} (${daysLeft} days ${daysLeft >= 0 ? 'left' : 'overdue'})</small>
            </div>
            <div>
                <button onclick="window.returnBookFromProfile('${borrowed.bookId}')" 
                        class="action-btn" 
                        style="background: var(--secondary-color); color: white; padding: 8px 16px; border: none; border-radius: 5px; cursor: pointer;">
                    Return Book
                </button>
            </div>
        `;
        
        myBorrowedBooks.appendChild(bookItem);
    }
}

// Helper functions
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

async function deleteBookConfirm(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        showLoading(true);
        const result = await deleteBook(bookId);
        if (result.success) {
            alert('Book deleted successfully!');
            loadManageBooks();
        } else {
            alert('Failed to delete book: ' + result.error);
        }
        showLoading(false);
    }
}

async function editBook(bookId) {
    const book = await getBook(bookId);
    const newTitle = prompt('Enter new title:', book.title);
    if (newTitle && newTitle !== book.title) {
        showLoading(true);
        const result = await updateBook(bookId, { title: newTitle });
        if (result.success) {
            alert('Book updated successfully!');
            loadManageBooks();
        } else {
            alert('Failed to update book: ' + result.error);
        }
        showLoading(false);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('bookModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Check for overdue books daily
setInterval(() => {
    const hour = new Date().getHours();
    if (hour === 9) { // Check at 9 AM
        checkOverdueBooks();
    }
}, 3600000); // Check every hour

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Copy book code to clipboard
function copyBookCode(bookId) {
    navigator.clipboard.writeText(bookId).then(() => {
        alert('Book code copied to clipboard!');
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = bookId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Book code copied to clipboard!');
    });
}

// Import books from CSV
function importCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    const statusDiv = document.getElementById('importStatus');
    
    if (!file) {
        alert('Please select a CSV file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const text = e.target.result;
        const lines = text.split('\n');
        let successCount = 0;
        let errorCount = 0;
        
        statusDiv.innerHTML = 'Importing books...';
        showLoading(true);
        
        for (let i = 1; i < lines.length; i++) { // Skip header if exists
            if (lines[i].trim() === '') continue;
            
            try {
                // Parse CSV line (handle quoted values)
                const values = parseCSVLine(lines[i]);
                
                if (values.length >= 5) {
                    const bookData = {
                        title: values[0].trim(),
                        author: values[1].trim(),
                        isbn: values[2].trim(),
                        quantity: parseInt(values[3]) || 1,
                        category: values[4].trim().toLowerCase(),
                        description: values[5] ? values[5].trim() : ''
                    };
                    
                    const result = await addBook(bookData);
                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                        console.error(`Failed to add book: ${bookData.title}`, result.error);
                    }
                } else {
                    errorCount++;
                    console.error(`Invalid CSV format at line ${i + 1}`);
                }
            } catch (error) {
                errorCount++;
                console.error(`Error processing line ${i + 1}:`, error);
            }
        }
        
        showLoading(false);
        statusDiv.innerHTML = `Import complete! Successfully added: ${successCount} books. Errors: ${errorCount}`;
        fileInput.value = ''; // Clear file input
        loadManageBooks(); // Refresh book list
    };
    
    reader.readAsText(file);
}

// Parse CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current); // Add last value
    return values;
}

// Scan barcode from uploaded image
window.scanBarcodeImage = function() {
    const fileInput = document.getElementById('barcodeFile');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    Html5Qrcode.scanFile(file, true)
        .then(decodedText => {
            console.log('Image scan successful:', decodedText);
            processBookTransaction(decodedText);
            fileInput.value = ''; // Clear the input
        })
        .catch(err => {
            alert('Failed to scan barcode from image. Please make sure the image contains a clear barcode.');
            console.error('Image scan error:', err);
        });
};

// Return book from profile page
window.returnBookFromProfile = async function(bookId) {
    if (confirm('Are you sure you want to return this book?')) {
        showLoading(true);
        
        const book = await getBook(bookId);
        if (!book) {
            alert('Book not found!');
            showLoading(false);
            return;
        }
        
        const result = await returnBook(bookId, currentUser.uid);
        
        if (result.success) {
            alert(`Book "${book.title}" returned successfully!`);
            // Reload user profile to update the list
            currentUserProfile = await getUserProfile(currentUser.uid);
            loadUserBorrowedBooks();
        } else {
            alert('Failed to return book: ' + result.error);
        }
        
        showLoading(false);
    }
};

// Make functions globally accessible
window.togglePassword = togglePassword;
window.copyBookCode = copyBookCode;
window.importCSV = importCSV;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showSection = showSection;
window.logout = logout;
window.closeModal = closeModal;
window.printBarcode = printBarcode;
window.startScanner = startScanner;
window.stopScanner = stopScanner;
window.processManualEntry = processManualEntry;
window.showBookDetails = showBookDetails;
window.editBook = editBook;
window.deleteBookConfirm = deleteBookConfirm;
window.changeUserRole = changeUserRole;
window.searchBooks = searchBooks;
window.switchLanguage = switchLanguage;

// Date picker helper functions
window.confirmBorrow = async function(bookId) {
    const returnDate = document.getElementById('returnDatePicker').value;
    if (!returnDate) {
        alert('Please select a return date');
        return;
    }
    
    // Remove dialog
    document.body.removeChild(document.getElementById('dateDialogBackdrop'));
    document.body.removeChild(document.querySelector('div[style*="position: fixed"][style*="transform: translate"]'));
    
    showLoading(true);
    const book = await getBook(bookId);
    const result = await borrowBook(bookId, currentUser.uid, new Date(returnDate).toISOString());
    
    if (result.success) {
        alert(`Book "${book.title}" borrowed successfully!\nReturn by: ${new Date(returnDate).toLocaleDateString()}`);
    } else {
        alert('Failed to borrow book: ' + result.error);
    }
    showLoading(false);
};

window.cancelBorrow = function() {
    // Remove dialog
    document.body.removeChild(document.getElementById('dateDialogBackdrop'));
    document.body.removeChild(document.querySelector('div[style*="position: fixed"][style*="transform: translate"]'));
};

// Copy book code to clipboard
function copyBookCode(bookId) {
    navigator.clipboard.writeText(bookId).then(() => {
        alert('Book code copied to clipboard!');
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = bookId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Book code copied to clipboard!');
    });
}

// Import books from CSV
function importCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    const statusDiv = document.getElementById('importStatus');
    
    if (!file) {
        alert('Please select a CSV file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const text = e.target.result;
        const lines = text.split('\n');
        let successCount = 0;
        let errorCount = 0;
        
        statusDiv.innerHTML = 'Importing books...';
        showLoading(true);
        
        for (let i = 1; i < lines.length; i++) { // Skip header if exists
            if (lines[i].trim() === '') continue;
            
            try {
                // Parse CSV line (handle quoted values)
                const values = parseCSVLine(lines[i]);
                
                if (values.length >= 5) {
                    const bookData = {
                        title: values[0].trim(),
                        author: values[1].trim(),
                        isbn: values[2].trim(),
                        quantity: parseInt(values[3]) || 1,
                        category: values[4].trim().toLowerCase(),
                        description: values[5] ? values[5].trim() : ''
                    };
                    
                    const result = await addBook(bookData);
                    if (result.success) {
                        successCount++;
                    } else {
                        errorCount++;
                        console.error(`Failed to add book: ${bookData.title}`, result.error);
                    }
                } else {
                    errorCount++;
                    console.error(`Invalid CSV format at line ${i + 1}`);
                }
            } catch (error) {
                errorCount++;
                console.error(`Error processing line ${i + 1}:`, error);
            }
        }
        
        showLoading(false);
        statusDiv.innerHTML = `Import complete! Successfully added: ${successCount} books. Errors: ${errorCount}`;
        fileInput.value = ''; // Clear file input
        loadManageBooks(); // Refresh book list
    };
    
    reader.readAsText(file);
}

// Parse CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current); // Add last value
    return values;
}
