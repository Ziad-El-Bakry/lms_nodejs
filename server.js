const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// --- HOME PAGE (DASHBOARD) ---
app.get('/', async (req, res) => {
    try {
        const [bookCount] = await db.query('SELECT COUNT(*) as count FROM books');
        const [memberCount] = await db.query('SELECT COUNT(*) as count FROM members');
        const [borrowCount] = await db.query("SELECT COUNT(*) as count FROM borrow WHERE status = 'borrowed' OR status = 'overdue'");
        const [overdueCount] = await db.query("SELECT COUNT(*) as count FROM borrow WHERE status = 'overdue'");

        res.render('index', {
            totalBooks: bookCount[0].count,
            totalMembers: memberCount[0].count,
            activeBorrows: borrowCount[0].count,
            overdue: overdueCount[0].count
        });
    } catch (err) {
        console.error(err);
        res.render('index', { 
            totalBooks: 0, totalMembers: 0, activeBorrows: 0, overdue: 0 
        });
    }
});

// =======================
// --- BOOKS SECTION ---
// =======================

// 1. عرض الكتب
app.get('/books', async (req, res) => {
    try { 
        const [rows] = await db.query('SELECT * FROM books');
        res.render('books', { books: rows });
    } catch (err) {
        console.error(err);
        res.send("Error loading books: " + err.message);
    }
});

// 2. إضافة كتاب جديد
app.post('/add-book', async (req, res) => {
    const { title, author, category } = req.body;
    try {
        await db.query(
            "INSERT INTO books (title, author, category, status) VALUES (?, ?, ?, 'available')",
            [title, author, category]
        );
        res.redirect('/books');
    } catch (err) {
        console.error(err);
        res.send("Error adding book");
    }
});

// 3. تعديل كتاب (NEW)
app.post('/update-book', async (req, res) => {
    const { id, title, author, category } = req.body;
    try {
        await db.query(
            'UPDATE books SET title = ?, author = ?, category = ? WHERE book_id = ?',
            [title, author, category, id]
        );
        res.redirect('/books');
    } catch (err) {
        console.error(err);
        res.send("Error updating book");
    }
});

// 4. حذف كتاب (NEW)
app.post('/delete-book/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM books WHERE book_id = ?', [req.params.id]);
        res.redirect('/books');
    } catch (err) {
        console.error(err);
        res.send("Error deleting book");
    }
});

// =======================
// --- MEMBERS SECTION ---
// =======================

// 1. عرض الأعضاء
app.get('/members', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM members');
        res.render('members', { members: rows });
    } catch (err) {
        console.error(err);
        res.send("Error loading members");
    }
});

// 2. إضافة عضو جديد
app.post('/add-member', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        await db.query(
            'INSERT INTO members (name, email, phone) VALUES (?, ?, ?)',
            [name, email, phone]
        );
        res.redirect('/members');
    } catch (err) {
        console.error(err);
        res.send("Error adding member");
    }
});

// 3. تعديل عضو (NEW)
app.post('/update-member', async (req, res) => {
    const { id, name, email, phone } = req.body;
    try {
        await db.query(
            'UPDATE members SET name = ?, email = ?, phone = ? WHERE member_id = ?',
            [name, email, phone, id]
        );
        res.redirect('/members');
    } catch (err) {
        console.error(err);
        res.send("Error updating member");
    }
});

// 4. حذف عضو (NEW)
app.post('/delete-member/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM members WHERE member_id = ?', [req.params.id]);
        res.redirect('/members');
    } catch (err) {
        console.error(err);
        res.send("Error deleting member");
    }
});

// =======================
// --- BORROW SECTION ---
// =======================

app.get('/borrow', async (req, res) => {
    try {
        // تحديث حالة الكتب المتأخرة
        await db.query(`
            UPDATE borrow
            SET status = 'overdue'
            WHERE return_date < CURDATE()
            AND status = 'borrowed'
        `);

        // جلب بيانات الاستعارة
        const [borrows] = await db.query(`
            SELECT 
                b.borrow_id AS id,
                b.borrow_date AS borrowed,
                b.return_date,
                b.status,
                m.name AS member_name,
                bk.title AS book_title
            FROM borrow b
            JOIN members m ON b.member_id = m.member_id
            JOIN books bk ON b.book_id = bk.book_id
            ORDER BY b.borrow_id DESC
        `);
        
        const [members] = await db.query("SELECT * FROM members");
        const [books] = await db.query("SELECT * FROM books WHERE status = 'available'");

        res.render("borrow", { borrows, members, books });
    } catch (err) {
        console.error("Error in /borrow:", err);
        res.send("Error loading borrow page: " + err.message);
    }
});

// إضافة استعارة جديدة
app.post('/add-borrow', async (req, res) => {
    const { member_id, book_id, borrow_date, return_date } = req.body;

    try {
        // 1. إنشاء سجل استعارة
        await db.query(
            `INSERT INTO borrow 
            (member_id, book_id, borrow_date, return_date, status) 
            VALUES (?, ?, ?, ?, 'borrowed')`,
            [member_id, book_id, borrow_date, return_date]
        );

        // 2. تحديث حالة الكتاب إلى 'borrowed'
        await db.query(
            `UPDATE books SET status = 'borrowed' WHERE book_id = ?`,
            [book_id]
        );

        res.redirect("/borrow");
    } catch (err) {
        console.error("Error adding borrow:", err);
        res.status(500).send("Error adding borrow record: " + err.message);
    }
});

// إرجاع كتاب
app.post('/return-book/:id', async (req, res) => {
    const borrow_id = req.params.id;

    try {
        const [borrow] = await db.query(
            'SELECT book_id FROM borrow WHERE borrow_id = ?',
            [borrow_id]
        );

        await db.query(
            `UPDATE borrow SET status = 'returned' WHERE borrow_id = ?`,
            [borrow_id]
        );

        if (borrow.length > 0) {
            await db.query(
                `UPDATE books SET status = 'available' WHERE book_id = ?`,
                [borrow[0].book_id]
            );
        }

        res.redirect("/borrow");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error returning book");
    }
});

// --- START SERVER ---
app.listen(3000, () => {
    console.log("LMS running at http://localhost:3000");
});