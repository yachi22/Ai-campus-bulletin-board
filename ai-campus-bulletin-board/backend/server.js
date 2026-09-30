require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Core middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/health', healthRoutes);

// TODO: Phase 3+
// auth, users, bulletins, events, comments, reactions,
// notifications, AI, and admin routes will be added later.

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await testConnection();
});