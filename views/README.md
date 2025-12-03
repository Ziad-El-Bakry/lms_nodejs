# 📚 Library Management System (LMS) - Node.js & MySQL

This project is a simple Library Management System (LMS) built using Node.js and the Express framework. It utilizes EJS as the templating engine and MySQL for data persistence.

---

## ✨ Key Features

* **Books Management:** Add, view, and track the status of all books.
* **Members Management:** Register and view member details.
* **Borrowing Management:** Record and manage loan check-out and return processes.
* **Automatic Status Tracking:** Book status (`available`/`borrowed`) is updated automatically upon loan events.
* **Overdue Detection:** Loan records are automatically marked as 'overdue' if the return date passes.
* **Dashboard:** A central dashboard displaying real-time statistics (total books, active members, overdue loans).

---

## 🛠️ Technology Stack

| Technology | Role |
| :--- | :--- |
| **Backend** | Node.js |
| **Framework** | Express.js |
| **Database** | MySQL |
| **DB Driver** | `mysql2` (with Promise support) |
| **Templating** | EJS (Embedded JavaScript) |
| **Styling** | Bootstrap 5.3 |

---

## ⚙️ Prerequisites

You must have the following installed on your system to run this project:

* **Node.js & npm:** (Version 18 or later is recommended).
* **MySQL Server:** (e.g., XAMPP, WAMP, or MySQL Workbench).

---

## 🚀 Installation and Setup

Follow these steps to get the project running locally:

### 1. Database Configuration

1.  **Create Database:** Create a new database named `lms_node`.
2.  **Import Schema:** Import the content of the **`lms_node.sql`** file into your newly created database.
3.  **Verify Structure:** Ensure the `books` table contains the necessary `status` column. If you haven't run the fix previously, execute this SQL command:
    ```sql
    ALTER TABLE books ADD COLUMN status ENUM('available', 'borrowed') DEFAULT 'available';
    UPDATE books SET status = 'available';
    ```

### 2. Configure Connection

* Verify that your **`db.js`** file contains the correct MySQL credentials (user, password, and database name).

### 3. Install Dependencies

In the project's root directory, run the installation command:
```bash
npm install


## 4. Start the Server
Launch the Express application:

Bash
node server.js
The application will be accessible at: http://localhost:3000

🗺️ Database Schema Overview
The project relies on the following tables in the lms_node database:
Table,      Purpose,                        Primary Columns
books,      Stores book details,            "book_id, title, author, status"
members,    Stores member information,      "member_id, name, email, phone"
borrow,     Records loan transactions,      "borrow_id, member_id (FK), book_id (FK), status"