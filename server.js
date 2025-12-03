const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// --- HOME PAGE ---

app.get('/', async (req, res) => {
    try {
       
        const [bookCount] = await db.query('SELECT COUNT(*) as count FROM books');
        
        
        const [memberCount] = await db.query('SELECT COUNT(*) as count FROM members');
        const [borrowCount] = await db.query("SELECT COUNT(*) as count FROM borrow WHERE status = 'borrowed' OR status = 'overdue'");
        const [overdueCount] = await db.query("SELECT COUNT(*) as count FROM borrow WHERE status = 'overdue'");

        // إرسال البيانات إلى ملف index.ejs
        res.render('index', {
            totalBooks: bookCount[0].count,
            totalMembers: memberCount[0].count,
            activeBorrows: borrowCount[0].count,
            overdue: overdueCount[0].count
        });
    } catch (err) {
        console.error(err);
        // في حالة الخطأ، نرسل أصفاراً لتجنب توقف الموقع
        res.render('index', { 
            totalBooks: 0, 
            totalMembers: 0, 
            activeBorrows: 0, 
            overdue: 0 
        });
    }
});
// --- BOOKS PAGE ---
app.get('/books', async (req, res) => {
    try { 
        const [rows] = await db.query('SELECT * FROM books');
        res.render('books', { books: rows });
    } catch (err) {
        console.error(err);
        res.send("Error loading books: " + err.message);
    }
});

app.post('/add-book', async (req, res) => {
    const { title, author, category } = req.body;
    try {
        // إضافة الكتاب مع الحالة الافتراضية 'available'
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

// --- MEMBERS PAGE ---
app.get('/members', async (req, res) => {
    try {
        // تم تصحيح اسم الجدول من member إلى members
        const [rows] = await db.query('SELECT * FROM members');
        res.render('members', { members: rows });
    } catch (err) {
        console.error(err);
        res.send("Error loading members");
    }
});

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

// --- BORROW PAGE ---
app.get('/borrow', async (req, res) => {
    try {
        // تحديث حالة الكتب المتأخرة
        await db.query(`
            UPDATE borrow
            SET status = 'overdue'
            WHERE return_date < CURDATE()
            AND status = 'borrowed'
        `);

        // جلب بيانات الاستعارة مع أسماء مستعارة (Aliases) لتناسب ملف العرض borrow.ejs
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

// --- ADD BORROW ---
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
        // هذا السطر كان يسبب الخطأ سابقاً بسبب عدم وجود عمود status
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

// --- RETURN BOOK ---
app.post('/return-book/:id', async (req, res) => {
    const borrow_id = req.params.id;

    try {
        // معرفة الكتاب المرتبط بعملية الاستعارة
        const [borrow] = await db.query(
            'SELECT book_id FROM borrow WHERE borrow_id = ?',
            [borrow_id]
        );

        // تحديث حالة الاستعارة إلى 'returned'
        await db.query(
            `UPDATE borrow SET status = 'returned' WHERE borrow_id = ?`,
            [borrow_id]
        );

        // إعادة الكتاب إلى حالة 'available'
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

app.listen(3000, () => {
    console.log("LMS running at http://localhost:3000");
});