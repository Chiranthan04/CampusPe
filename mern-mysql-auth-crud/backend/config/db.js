const mysql = require('mysql2');
require('dotenv').config();

const USE_REAL_DB = process.env.USE_REAL_DB === 'true';
let promisePool = null;

if (USE_REAL_DB) {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mern_auth_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  promisePool = pool.promise();
  pool.getConnection((err, connection) => {
    if (err) { console.error('MySQL Connection Error:', err.message); return; }
    console.log('MySQL Connected Successfully');
    connection.release();
  });
} else {
  console.log('[DEMO MODE] Using in-memory data store. No MySQL required.');
}

module.exports = promisePool;