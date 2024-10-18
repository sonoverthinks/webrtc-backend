const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const dbConfig = require("./dbConfig");

// Create database connection
const connection = mysql.createPool(dbConfig);

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, password, callerID } = req.body;

    // Validate input
    if (!username || !password || !callerID) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const query = `
        INSERT INTO auth.user (username, password, callerID)
        VALUES (?, ?, ?);
      `;
    const values = [username, hashedPassword, callerID];
    const [result] = await connection.execute(query, values);

    res.json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide username and password" });
    }

    // Find user by username
    const query = `
        SELECT * FROM auth.user
        WHERE username = ?;
      `;
    const values = [username];
    const [rows] = await connection.execute(query, values);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // Compare passwords using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Login successful, return response
    res.json({
      message: "User logged in successfully",
      userData: {
        id: user.id,
        username: user.username,
        callerID: user.callerID,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in user" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const query = "SELECT * FROM auth.user;";
    const [rows] = await connection.execute(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = "SELECT * FROM auth.user WHERE id = ?;";
    const values = [id];
    const [rows] = await connection.execute(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

module.exports = router;
