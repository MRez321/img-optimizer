// models/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Optional: Test connection on startup
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to the database.');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        // In a real application, you might want to handle this more gracefully
        // or exit the process if the database is critical.
    }
}
testConnection();

module.exports = pool;
