const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function optimizeImages() {
    return new Promise((resolve, reject) => {
        const folderPath = path.join(__dirname, 'uploads');
        const optimizedFolderPath = path.join(__dirname, 'optimized');

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        if (!fs.existsSync(optimizedFolderPath)) {
            fs.mkdirSync(optimizedFolderPath);
        }

        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                reject(err);
                return;
            }

            const promises = files.map(file => {
                return new Promise((resolveFile, rejectFile) => {
                    const filePath = path.join(folderPath, file);
                    fs.stat(filePath, (err, stats) => {
                        if (err) {
                            console.error('Error getting file stats:', err);
                            rejectFile(err);
                            return;
                        }

                        // Check if the file is a directory
                        if (stats.isDirectory()) {
                            console.log(`Skipping directory: ${file}`);
                            resolveFile();
                            return;
                        }

                        const outputFilePath = path.join(optimizedFolderPath, `${path.parse(file).name}.webp`);
                        sharp(filePath)
                            .webp({ quality: 80 })
                            .toFile(outputFilePath, (err, info) => {
                                if (err) {
                                    console.error('Error compressing image:', err);
                                    rejectFile(err);
                                    return;
                                }
                                // Rename the optimized image after compression
                                const newName = `${path.parse(file).name}.webp`.toLowerCase().replace(/\s+/g, '-');
                                const newFilePath = path.join(optimizedFolderPath, newName);

                                fs.rename(outputFilePath, newFilePath, (err) => {
                                    if (err) {
                                        console.error(`Error renaming optimized image ${file}:`, err);
                                        rejectFile(err);
                                    } else {
                                        console.log(`Renamed optimized image ${file} to ${newName}`);
                                        resolveFile();
                                    }
                                });
                            });
                    });
                });
            });

            Promise.all(promises)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    });
}

module.exports = optimizeImages;
