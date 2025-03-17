const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',   // Replace with your MySQL username
    password: '',   // Replace with your MySQL password
    database: 'ussd_platform'  // Replace with your database name
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySQL database.");
});

// Get Retailers API
app.get("/api/retailers", (req, res) => {
    db.query("SELECT * FROM retailers", (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Get Products by Retailer ID
app.get("/api/products/:retailerId", (req, res) => {
    const retailerId = req.params.retailerId;
    
    db.query("SELECT * FROM product WHERE retailer_id = ?", [retailerId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
