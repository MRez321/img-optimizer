const archiver = require('archiver');
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const optimizedFolderPath = path.join(__dirname, '../optimized');
const zipFilePath = path.join(__dirname, '../optimized/optimized.zip');

// Function to get all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
}

// Function to create a zip file from a list of files
function createZip(files) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Set compression level
        });

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve();
        });

        archive.on('error', function (err) {
            reject(err);
        });

        archive.pipe(output);

        files.forEach(function (file) {
            const fileName = path.basename(file);
            archive.append(fs.createReadStream(file), { name: fileName });
        });

        archive.finalize();
    });
}

// Serve the zip file for download
router.get('/download', (req, res) => {
    res.download(zipFilePath, 'optimized.zip', (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Route to trigger the creation of the zip file
router.get('/create-zip', async (req, res) => {
    try {
        const files = getAllFiles(optimizedFolderPath);
        await createZip(files);
        res.send('Zip file created successfully. <a href="/download">Download</a>');
    } catch (err) {
        console.error('Error creating zip file:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
