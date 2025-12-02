# Library Management System

This is a web-based Library Management System that allows users to manage books, track borrowing and returns, and manage user accounts. It is built using HTML, CSS, and JavaScript, with Firebase for the backend.

## Features

- User authentication (login, registration)
- Browse and search for books
- Borrow and return books
- View transaction history
- Manage books (add, edit, delete) (staff only)
- Manage users (view, change roles) (staff only)
- Barcode scanner for easy book processing
- Multilingual support (English, Malay)

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/library-management-system.git
   ```

2. **Firebase Configuration:**
   - Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
   - In your Firebase project, go to **Project settings** and copy your Firebase config.
   - In `firebase.js`, replace the `firebaseConfig` object with your own Firebase project's configuration.

3. **EmailJS Configuration:**
   - Create an account at [https://www.emailjs.com/](https://www.emailjs.com/).
   - In `firebase.js`, replace `YOUR_SERVICE_ID`, `YOUR_TEMPLATE_ID`, and `YOUR_PUBLIC_KEY` with your EmailJS credentials.

4. **Open `index.html` in your browser:**
   - You can open the `index.html` file directly in your web browser to run the application.

## Usage

- **Login/Register:** Create an account or log in with your existing credentials.
- **Browse Books:** View the list of available books, search for specific titles, and filter by category or status.
- **Borrow/Return:** Use the barcode scanner or manually enter the book ID to borrow or return books.
- **Manage Books (Staff):** Add new books, edit existing book details, or delete books from the library.
- **Manage Users (Staff):** View a list of all registered users and change their roles.
- **Profile:** View your own profile information and a list of your borrowed books.
- **Rules:** Read the library's rules and regulations.
