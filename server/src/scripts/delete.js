const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const optimizedFolderPath = path.join(__dirname, 'optimized');
const uploadsFolderPath = path.join(__dirname, 'uploads');

// // Serve frontend files
// app.use(express.static(path.join(__dirname, 'public')));

// Function to delete all files inside a directory
function deleteFilesInDirectory(directory) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${directory}:`, err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(directory, file);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}:`, err);
                }
            });
        });
    });
}

// Function to delete files in multiple directories
function deleteFilesInDirectories(directoryPaths) {
    directoryPaths.forEach(directory => {
        deleteFilesInDirectory(directory);
    });
}

// Endpoint to delete files
app.delete('/delete-files', (req, res) => {
    deleteFilesInDirectories([optimizedFolderPath, uploadsFolderPath]);
    console.log('All files inside "optimized" and "uploads" folders deleted');
    res.sendStatus(200);
});


module.exports = deleteFilesInDirectories;
