// server/server.js - Express application entry point
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const dailyPlanRoutes = require('./routes/dailyPlanRoutes');
const taskPoolRoutes = require('./routes/taskPoolRoutes');
const templateRoutes = require('./routes/templateRoutes');

// ============================================================
// Connect to localhost PostgreSQL (managed externally)
// Run migrations manually: npm run db:migrate
// ============================================================
let appServer = null;
let isShuttingDown = false;

// ---- Express app setup ----
const app = express();
const PORT = process.env.PORT || 17321;

// Enable CORS so Tauri frontend (file://) can reach this server
app.use(cors());

app.use(bodyParser.json());

// API routes
app.use('/api/daily-plan', dailyPlanRoutes);
app.use('/api/tasks', taskPoolRoutes);
app.use('/api/templates', templateRoutes);

// Serve React static files (SPA)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Health check endpoint for Tauri lifecycle polling
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

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

// ---- Graceful shutdown handler ----
async function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('[Server] Graceful shutdown initiated...');

  // Close HTTP server
  if (appServer) {
    appServer.close(() => {
      console.log('[Server] Express HTTP server closed');
    });
  }

  // Exit process
  process.exit(0);
}

// Listen for shutdown signals from Tauri
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
// Windows doesn't send SIGTERM/SIGINT reliably, also listen for custom IPC
process.on('message', (msg) => {
  if (msg === 'shutdown') {
    gracefulShutdown();
  }
});

// ---- Start Express server ----
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[Server] Daily Planner Express running on http://127.0.0.1:${PORT}`);
});