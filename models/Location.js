const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// API endpoint to fetch regions, countries, and coordinates
router.get('/data', (req, res) => {
    const filePath = path.join(__dirname, '../data/locations.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading locations file:', err);
            return res.status(500).json({ msg: 'Server error' });
        }

        res.json(JSON.parse(data));
    });
});

module.exports = router;
