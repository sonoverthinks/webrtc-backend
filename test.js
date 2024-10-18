// test.js
const pool = require("./dbConfig");

async function testConnection() {
  try {
    const [rows] = await pool.execute("SELECT 1 + 1 AS result");
    console.log(rows[0].result); // Output: 2
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
}

testConnection();
