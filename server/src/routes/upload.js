const express = require('express');
const multer = require('multer');

const router = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../src/uploads/');
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        cb(null, originalName);
    },
});

const upload = multer({ storage: storage });


router.post('/upload', upload.array('files', 20), (req, res) => {
    if (req.files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    res.send('Files uploaded successfully');
});


module.exports = router;
