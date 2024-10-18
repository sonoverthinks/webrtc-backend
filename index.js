const express = require("express");
const app = express();
const authRouter = require("./auth");
const dbConfig = require("./dbConfig");

// Create database connection
const mysql = require("mysql2/promise");
const connection = mysql.createPool(dbConfig);

// Middleware
app.use(express.json());

// Routes
app.use("/api", authRouter);

// Error handling
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
