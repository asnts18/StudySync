const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'studysync',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute queries
async function query(sql, params) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

// Helper function to call stored procedures
async function callProcedure(procedure, params = []) {
  const connection = await pool.getConnection();
  try {
    const [rows, fields] = await connection.execute(
      `CALL ${procedure}(${params.map(() => '?').join(',')})`, 
      params
    );
    return rows[0]; // Most stored procedures return a result set
  } finally {
    connection.release();
  }
}

module.exports = {
  query,
  callProcedure,
  pool
};