import mysql from 'mysql2/promise';

// Create a connection pool that works in serverless environments
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Handle connection errors
pool.on('connection', function (connection) {
  console.log('New connection established');
});

pool.on('error', function (err) {
  console.error('Database error:', err);
});

export default pool; 