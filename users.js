// users.js (Router)
const express = require("express");
const router = express.Router();
const pool = require("./dbConfig"); // Database connection

// Create User
router.post("/users", async (req, res) => {
  try {
    const { callerID, username, password } = req.body;
    const query = `
      INSERT INTO user (callerID, username, password)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [callerID, username, password];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Get All Users
router.get("/users", async (req, res) => {
  try {
    const query = "SELECT * FROM user";
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get User by ID
router.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = "SELECT * FROM user WHERE id = $1";
    const values = [id];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "User not found" });
  }
});

module.exports = router;
