    // Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgzsZp9Waa4W4IyhNRXIRPKm3h6hX2nrg",
    authDomain: "library-management-syste-fdc63.firebaseapp.com",
    databaseURL: "https://library-management-syste-fdc63-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "library-management-syste-fdc63",
    storageBucket: "library-management-syste-fdc63.firebasestorage.app",
    messagingSenderId: "1037857208854",
    appId: "1:1037857208854:web:3441f9a233558fa869d337",
    measurementId: "G-SBYWKH3K99"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const database = firebase.database();

// EmailJS Configuration
// IMPORTANT: Replace with your EmailJS credentials
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';    // Replace with your service ID (e.g., 'service_abc123')
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // Replace with your template ID (e.g., 'template_xyz789')
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';    // Replace with your REAL public key from EmailJS dashboard

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Authentication Functions
/**
 * Registers a new user with email, password, name, and role.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} name - The user's full name.
 * @param {string} role - The user's role (e.g., 'user', 'staff').
 * @returns {Promise<object>} - A promise that resolves to an object with success status and user data or an error message.
 */
async function registerUser(email, password, name, role) {
    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Wait a moment for auth to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save user profile to database
        await database.ref('users/' + user.uid).set({
            name: name,
            email: email,
            role: role,
            joinDate: new Date().toISOString(),
            borrowedBooks: []
        });

        console.log('User profile saved successfully');

        return { success: true, user: user };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Logs in a user with email and password.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - A promise that resolves to an object with success status and user data or an error message.
 */
async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Logs out the current user.
 * @returns {Promise<void>} - A promise that resolves when the user is logged out.
 */
function logoutUser() {
    return auth.signOut();
}

// User Profile Functions
/**
 * Retrieves the profile of a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object|null>} - A promise that resolves to the user's profile object or null if not found.
 */
async function getUserProfile(userId) {
    try {
        const snapshot = await database.ref('users/' + userId).once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

/**
 * Updates a user's profile.
 * @param {string} userId - The ID of the user to update.
 * @param {object} updates - An object containing the profile fields to update.
 * @returns {Promise<object>} - A promise that resolves to an object with success status or an error message.
 */
async function updateUserProfile(userId, updates) {
    try {
        await database.ref('users/' + userId).update(updates);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Book Management Functions
/**
 * Adds a new book to the database.
 * @param {object} bookData - An object containing the book's details.
 * @returns {Promise<object>} - A promise that resolves to an object with success status and the new book's ID or an error message.
 */
async function addBook(bookData) {
    try {
        // Generate unique book ID
        const bookId = database.ref().child('books').push().key;

        // Add book ID and timestamp to book data
        bookData.id = bookId;
        bookData.addedDate = new Date().toISOString();
        bookData.available = true;
        bookData.borrowedBy = null;
        bookData.borrowedDate = null;
        bookData.returnDate = null;

        // Save to database
        await database.ref('books/' + bookId).set(bookData);

        return { success: true, bookId: bookId };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Updates a book's information.
 * @param {string} bookId - The ID of the book to update.
 * @param {object} updates - An object containing the book fields to update.
 * @returns {Promise<object>} - A promise that resolves to an object with success status or an error message.
 */
async function updateBook(bookId, updates) {
    try {
        await database.ref('books/' + bookId).update(updates);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Deletes a book from the database.
 * @param {string} bookId - The ID of the book to delete.
 * @returns {Promise<object>} - A promise that resolves to an object with success status or an error message.
 */
async function deleteBook(bookId) {
    try {
        await database.ref('books/' + bookId).remove();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Retrieves all books from the database.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of book objects.
 */
async function getBooks() {
    try {
        const snapshot = await database.ref('books').once('value');
        const books = snapshot.val() || {};
        return Object.values(books);
    } catch (error) {
        console.error('Error getting books:', error);
        return [];
    }
}

/**
 * Retrieves a single book by its ID.
 * @param {string} bookId - The ID of the book to retrieve.
 * @returns {Promise<object|null>} - A promise that resolves to the book object or null if not found.
 */
async function getBook(bookId) {
    try {
        const snapshot = await database.ref('books/' + bookId).once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Error getting book:', error);
        return null;
    }
}

// Borrow/Return Functions
/**
 * Borrows a book for a user.
 * @param {string} bookId - The ID of the book to borrow.
 * @param {string} userId - The ID of the user borrowing the book.
 * @param {string} returnDate - The ISO string of the return date.
 * @returns {Promise<object>} - A promise that resolves to an object with success status or an error message.
 */
async function borrowBook(bookId, userId, returnDate) {
    try {
        const book = await getBook(bookId);
        if (!book || !book.available) {
            return { success: false, error: 'Book not available' };
        }

        // Update book status
        await database.ref('books/' + bookId).update({
            available: false,
            borrowedBy: userId,
            borrowedDate: new Date().toISOString(),
            returnDate: returnDate
        });

        // Add to user's borrowed books
        const userProfile = await getUserProfile(userId);
        const borrowedBooks = userProfile.borrowedBooks || [];
        borrowedBooks.push({
            bookId: bookId,
            borrowedDate: new Date().toISOString(),
            returnDate: returnDate
        });

        await database.ref('users/' + userId + '/borrowedBooks').set(borrowedBooks);

        // Log transaction
        await logTransaction({
            type: 'borrow',
            bookId: bookId,
            userId: userId,
            date: new Date().toISOString(),
            returnDate: returnDate
        });

        // Send email reminder (commented out for testing)
        // sendBorrowConfirmation(userProfile.email, userProfile.name, book.title, returnDate);

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Returns a borrowed book.
 * @param {string} bookId - The ID of the book to return.
 * @param {string} userId - The ID of the user returning the book.
 * @returns {Promise<object>} - A promise that resolves to an object with success status or an error message.
 */
async function returnBook(bookId, userId) {
    try {
        const book = await getBook(bookId);
        if (!book || book.available) {
            return { success: false, error: 'Book not borrowed' };
        }

        // Update book status
        await database.ref('books/' + bookId).update({
            available: true,
            borrowedBy: null,
            borrowedDate: null,
            returnDate: null
        });

        // Remove from user's borrowed books
        const userProfile = await getUserProfile(userId);
        const borrowedBooks = userProfile.borrowedBooks || [];
        const updatedBooks = borrowedBooks.filter(b => b.bookId !== bookId);

        await database.ref('users/' + userId + '/borrowedBooks').set(updatedBooks);

        // Log transaction
        await logTransaction({
            type: 'return',
            bookId: bookId,
            userId: userId,
            date: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Transaction Logging
/**
 * Logs a transaction in the database.
 * @param {object} transactionData - An object containing the transaction details.
 * @returns {Promise<object>} - A promise that resolves to an object with success status or an error message.
 */
async function logTransaction(transactionData) {
    try {
        const transactionId = database.ref().child('transactions').push().key;
        transactionData.id = transactionId;
        await database.ref('transactions/' + transactionId).set(transactionData);
        return { success: true };
    } catch (error) {
        console.error('Error logging transaction:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Retrieves the latest transactions.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of transaction objects.
 */
async function getTransactions() {
    try {
        const snapshot = await database.ref('transactions').orderByChild('date').limitToLast(50).once('value');
        const transactions = snapshot.val() || {};
        return Object.values(transactions).reverse();
    } catch (error) {
        console.error('Error getting transactions:', error);
        return [];
    }
}

// Email Functions using EmailJS
/**
 * Sends a borrow confirmation email to a user.
 * @param {string} email - The recipient's email address.
 * @param {string} name - The recipient's name.
 * @param {string} bookTitle - The title of the borrowed book.
 * @param {string} returnDate - The return date of the book.
 */
function sendBorrowConfirmation(email, name, bookTitle, returnDate) {
    // Skip if EmailJS not properly configured
    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
        console.log('EmailJS not configured - skipping email');
        return;
    }

    const templateParams = {
        to_email: email,
        to_name: name,
        book_title: bookTitle,
        return_date: new Date(returnDate).toLocaleDateString(),
        message: `You have successfully borrowed "${bookTitle}". Please return it by ${new Date(returnDate).toLocaleDateString()}.`
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('Email sent successfully:', response);
        }, function(error) {
            console.error('Failed to send email:', error);
        });
}

/**
 * Sends a return reminder email for an overdue book.
 * @param {string} email - The recipient's email address.
 * @param {string} name - The recipient's name.
 * @param {string} bookTitle - The title of the overdue book.
 * @param {number} daysOverdue - The number of days the book is overdue.
 */
function sendReturnReminder(email, name, bookTitle, daysOverdue) {
    const templateParams = {
        to_email: email,
        to_name: name,
        book_title: bookTitle,
        days_overdue: daysOverdue,
        message: `This is a reminder that "${bookTitle}" is ${daysOverdue} days overdue. Please return it as soon as possible.`
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('Reminder sent successfully:', response);
        }, function(error) {
            console.error('Failed to send reminder:', error);
        });
}

// Check for overdue books and send reminders
/**
 * Checks for overdue books and sends reminder emails.
 */
async function checkOverdueBooks() {
    try {
        const books = await getBooks();
        const today = new Date();

        for (const book of books) {
            if (!book.available && book.returnDate) {
                const returnDate = new Date(book.returnDate);
                const daysOverdue = Math.floor((today - returnDate) / (1000 * 60 * 60 * 24));

                if (daysOverdue > 0) {
                    const user = await getUserProfile(book.borrowedBy);
                    if (user) {
                        sendReturnReminder(user.email, user.name, book.title, daysOverdue);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking overdue books:', error);
    }
}

// User Management Functions (Staff only)
/**
 * Retrieves all users from the database.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of user objects.
 */
async function getAllUsers() {
    try {
        const snapshot = await database.ref('users').once('value');
        const users = snapshot.val() || {};
        return Object.entries(users).map(([id, data]) => ({ id, ...data }));
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

/**
 * Updates a user's role.
 * @param {string} userId - The ID of the user to update.
 * @param {string} newRole - The new role for the user.
 * @returns {Promise<object>} - A promise that resolves to an object with success status or an error message.
 */
async function updateUserRole(userId, newRole) {
    try {
        await database.ref('users/' + userId + '/role').set(newRole);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Real-time listeners
/**
 * Listens for real-time updates to the books data.
 * @param {function} callback - The function to call with the updated books data.
 */
function listenToBooks(callback) {
    database.ref('books').on('value', (snapshot) => {
        const books = snapshot.val() || {};
        callback(Object.values(books));
    });
}

/**
 * Listens for real-time updates to the transactions data.
 * @param {function} callback - The function to call with the updated transactions data.
 */
function listenToTransactions(callback) {
    database.ref('transactions').orderByChild('date').limitToLast(50).on('value', (snapshot) => {
        const transactions = snapshot.val() || {};
        callback(Object.values(transactions).reverse());
    });
}

// Helper function to generate book barcode data
/**
 * Generates barcode data for a book.
 * @param {string} bookId - The ID of the book.
 * @returns {string} - The barcode data.
 */
function generateBarcodeData(bookId) {
    // Just use the Firebase ID directly
    return bookId;
}
