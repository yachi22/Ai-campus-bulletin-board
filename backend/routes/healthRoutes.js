const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';

  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'disconnected';
  }

  res.json({
    success: true,
    message: 'AI Campus Bulletin Board API is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
