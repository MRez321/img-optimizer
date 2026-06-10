const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const archiver = require('archiver');

const optimizeImages = require('./src/scripts/optimize');

const deleteRoute = require('./src/routes/delete');

const downloadZipRoute = require('./src/routes/downloadZip');

const app = express();
const port = 3200;

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






app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
