const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const deleteFilesInDirectory = (directory) => {
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

const deleteFilesInDirectories = (directoryPaths) => {
    directoryPaths.forEach(directory => {
        deleteFilesInDirectory(directory);
    });
}

const optimizedFolderPath = path.join(__dirname, '../optimized');
const uploadsFolderPath = path.join(__dirname, '../uploads');


router.delete('/delete-files', (req, res) => {
    deleteFilesInDirectories([optimizedFolderPath, uploadsFolderPath]);
    console.log('All files inside "optimized" and "uploads" folders deleted');
    res.sendStatus(200);
});


module.exports = router;
