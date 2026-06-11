import dotenv from 'dotenv';

import app from './src/app.js';
import dbPool from './src/config/db.js';
import './src/services/cleanupService.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Start Server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);

    // Test DB connection
    try {
        await dbPool.query('SELECT 1+1 AS solution');
        console.log('✅ Database connection successful.');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
});