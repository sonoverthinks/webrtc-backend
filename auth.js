const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const dbConfig = require("./dbConfig");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Create database connection
const connection = mysql.createPool(dbConfig);

// Register user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("🚀 ~ router.post ~ username:", username);

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const callerID = uuidv4();

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
    // console.log("🚀 ~ router.post ~ rows:", rows);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    // console.log("🚀 ~ router.post ~ user:", user);

    // Compare passwords using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      username: user.username,
      callerID: user.callerID,
    };

    // Generate JWT token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Login successful, return response with JWT token
    res.json({
      message: "User logged in successfully",
      token,
      userData: payload,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in user" });
  }
});

module.exports = router;
