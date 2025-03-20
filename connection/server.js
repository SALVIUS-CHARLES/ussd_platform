const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "ussd_platform", // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

app.post("/api/register", (req, res) => {
  const { name, phoneNumber } = req.body;
  if (!name || !phoneNumber) {
    return res
      .status(400)
      .json({ error: "Name and phone number are required." });
  }

  const query = "INSERT INTO users (name, phone_number) VALUES (?, ?)";
  db.query(query, [name, phoneNumber], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({
        message: "User registered successfully!",
        userId: results.insertId,
      });
    }
  });
});

// Get Retailers API
app.get("/api/retailers", (req, res) => {
  db.query("SELECT * FROM retailers", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ message: "No retailers found." });
    } else {
      res.json(results);
    }
  });
});

// Get Products by Retailer ID
app.get("/api/products/:retailerId", (req, res) => {
  const retailerId = req.params.retailerId;

  db.query(
    "SELECT * FROM product WHERE retailer_id = ?",
    [retailerId],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(results);
      }
    }
  );
});

// Place order
app.post("/api/orders", (req, res) => {
  const { name, phoneNumber, location, product } = req.body;
  console.log("Received order:", req.body); // Log the request payload

  if (!name || !phoneNumber || !location || !product) {
    console.error("Missing fields in request:", {
      name,
      phoneNumber,
      location,
      product,
    });
    return res.status(400).json({ error: "All fields are required." });
  }

  const query =
    "INSERT INTO orders (name, phone_number, location, product_name, product_cost) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [name, phoneNumber, location, product.product_name, product.product_cost],
    (err, results) => {
      if (err) {
        console.error("Database error:", err.message); // Log database errors
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          message: "Order placed successfully!",
          orderId: results.insertId,
        });
      }
    }
  );
});

// Start Server
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
