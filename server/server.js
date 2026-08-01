// server/server.js - Main Express application entry point
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const dailyPlanRoutes = require('./routes/dailyPlanRoutes');
const taskPoolRoutes = require('./routes/taskPoolRoutes');
const templateRoutes = require('./routes/templateRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/daily-plan', dailyPlanRoutes);
app.use('/api/tasks', taskPoolRoutes);
app.use('/api/templates', templateRoutes);

// Serve React static files (SPA)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback - all non-API routes serve index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('Daily Planner server running on http://localhost:3000');
});
