import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: mysql.PoolOptions = {
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
async function testConnection(): Promise<void> {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to the database.');
        connection.release();
    } catch (error: any) {
        console.error('❌ Database connection failed:', error.message);
        // You can choose to exit the process here if DB is critical:
        // process.exit(1);
    }
}

// Run the test
testConnection();

export default pool;