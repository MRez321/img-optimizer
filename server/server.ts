const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const archiver = require('archiver');

dotenv.config();
const app = express();
const PORT = process.env.PORT || '3000';

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Parse URL-encoded bodies

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded images from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const dbPool = require('./src/config/db'); // Your DB connection
const drugRoutes = require('./src/routes/drugRoutes'); // Your API routes

const optimizeImages = require('./src/scripts/optimize');
const deleteRoute = require('./src/routes/delete');
const downloadZipRoute = require('./src/routes/downloadZip');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/');
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        cb(null, originalName);
    },
});
const upload = multer({ storage: storage });

app.post('/upload', upload.array('files', 20), (req, res) => {
    if (req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    res.send('Files uploaded successfully');
});

app.use('/', deleteRoute);
app.use('/', downloadZipRoute);

app.get('/optimize', (req, res) => {
    optimizeImages();
    res.send('Optimization process completed');
});











// Serve HTML files for your pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/kalagh',(req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'kalagh.html'));
});




// --- API Routes ---
app.use('/api', drugRoutes); // Mount your API routes under /api

// --- Basic Error Handling ---
// Catch 404 errors
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.stack);
    // Handle Multer errors specifically
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    }
    // Handle other errors
    res.status(err.statusCode || 500).json({
        message: err.message || 'Something went wrong on the server!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// --- Start Server ---
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Optional: Test DB connection on startup
    try {
        await dbPool.query('SELECT 1+1 AS solution');
        console.log('✅ Database connection successful.');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1); // Exit if DB connection fails
    }
});

