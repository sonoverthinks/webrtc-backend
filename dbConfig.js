const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// const pool = mysql.createPool(dbConfig);

module.exports = dbConfig;
