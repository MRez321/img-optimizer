const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Create a storage engine for multer to save files in user-specific folders
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create a folder based on client's IP address
        const userFolderPath = path.join(__dirname, `uploads/${getClientIp(req)}`);
        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath);
        }
        cb(null, userFolderPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Helper function to get client's IP address
function getClientIp(req) {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ipAddress.replace(/^.*:/, ''); // Remove IPv6 prefix if present
}

// Endpoint to handle file uploads
app.post('/upload', upload.single('image'), (req, res) => {
    // Get uploaded file details
    const fileName = req.file.filename;
    const filePath = req.file.path;

    // Optimize the uploaded image
    const optimizedFilePath = path.join(__dirname, `optimized/${getClientIp(req)}/${fileName}.webp`);
    sharp(filePath)
        .webp({ quality: 80 })
        .toFile(optimizedFilePath, (err, info) => {
            if (err) {
                console.error('Error optimizing image:', err);
                res.status(500).send('Error optimizing image');
                return;
            }

            // Send optimized image data back to frontend
            const optimizedData = {
                fileName: `${fileName}.webp`,
                fileSize: info.size // size of optimized image
            };
            res.json(optimizedData);

            // Clean up - delete original uploaded file
            fs.unlinkSync(filePath);
        });
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
