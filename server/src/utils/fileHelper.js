const fs = require('fs');
const path = require('path');

// Use this if you moved DATA_FILE and UPLOAD_DIR to config/index.js
// const { DATA_FILE, UPLOAD_DIR } = require('../config');

const DATA_FILE = path.join(__dirname, '..', 'data', 'drugs.json');
const UPLOAD_DIR = path.join(__dirname, '..', 'data', 'uploads');


function ensureUploadDirExists() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR);
    }
}

function loadDrugs() {
    ensureUploadDirExists(); // Ensure directory exists before reading
    try {
        if (!fs.existsSync(DATA_FILE)) return [];
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error("Error loading drugs:", error);
        return [];
    }
}

function saveDrugs(data) {
    ensureUploadDirExists(); // Ensure directory exists before writing
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error saving drugs:", error);
    }
}

module.exports = {
    loadDrugs,
    saveDrugs,
    UPLOAD_DIR, // Export if needed by multer in controller or server.js
};
