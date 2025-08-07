require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  database: 'library_db',
  connectionLimit: 10
});

// Promisify pool queries for async/await support
const promisePool = pool.promise();

module.exports = promisePool;
