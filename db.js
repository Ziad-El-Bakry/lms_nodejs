const mysql = require('mysql2');

// Create the connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // CHANGE THIS if your MySQL has a username
    password: '',      // CHANGE THIS if your MySQL has a password
    database: 'lms_node', // Updated to match your SQL file name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();