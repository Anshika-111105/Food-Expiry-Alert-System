// server.js
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("node-cron");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(bodyParser.json());
//DATABASE CONNECTION 
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "akriti0104", // change if you have a different MySQL password
  database: "food_expiry_db"
});

db.connect(err => {
  if (err) console.error("MySQL connection failed:", err);
  else console.log("MySQL connected successfully.");
});

// USER REGISTRATION
app.post("/register", async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.json({ success: false, message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, phone, password) VALUES (?, ?, ?)";
    db.query(sql, [name, phone, hashedPassword], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.json({ success: false, message: "Phone number already registered!" });
        }
        console.error(err);
        return res.json({ success: false, message: "Database error." });
      }
      res.json({ success: true, message: "Registration successful!" });
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error." });
  }
});

// USER LOGIN 
app.post("/login", (req, res) => {
  const { phone, password } = req.body;

  db.query("SELECT * FROM users WHERE phone = ?", [phone], async (err, result) => {
    if (err) return res.json({ message: "Database error" });
    if (result.length === 0) return res.json({ message: "User not found" });

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.json({ message: "Incorrect password" });

    res.json({
      success: true,
      message: "Login successful!",
      user_id: user.user_id,
      name: user.name,
    });
  });
});

//ADD NEW FOOD ITEM 
app.post("/add-item", (req, res) => {
  const { item_name, quantity, purchase_date, expiry_date, category, user_id } = req.body;

  if (!item_name || !quantity || !purchase_date || !expiry_date || !user_id) {
    return res.json({ success: false, message: "All fields except category are required." });
  }

  const sql = `
    INSERT INTO food_items (item_name, quantity, purchase_date, expiry_date, category, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [item_name, quantity, purchase_date, expiry_date, category, user_id], (err) => {
    if (err) {
      console.error("Error adding item:", err);
      res.status(500).json({ success: false, message: "Database error" });
    } else {
      res.json({ success: true, message: "Item added successfully!" });
    }
  });
});

//GET ALL ITEMS FOR A USER 
app.get("/items/:user_id", (req, res) => {
  const { user_id } = req.params;
  db.query("SELECT * FROM food_items WHERE user_id = ?", [user_id], (err, result) => {
    if (err) {
      console.error("Error fetching items:", err);
      res.status(500).json({ success: false, message: "Database error" });
    } else {
      res.json(result);
    }
  });
});

//DELETE ITEM 
app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM food_items WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error deleting item:", err);
      res.status(500).json({ success: false, message: "Database error" });
    } else {
      res.json({ success: true, message: "Item deleted successfully!" });
    }
  });
});

// CRON JOB: CHECK EXPIRY 
cron.schedule("0 8 * * *", () => {
  console.log("Checking for items expiring soon...");
  const query = `
    SELECT * FROM food_items 
    WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
  `;
  db.query(query, (err, results) => {
    if (err) console.error(err);
    else results.forEach(item => {
      console.log(`⚠️ ALERT: ${item.item_name} expires on ${item.expiry_date}`);
    });
  });
});

//START SERVER
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
