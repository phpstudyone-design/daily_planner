// knexfile.js - Knex configuration for SQLite
require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, process.env.DB_PATH || 'daily_planner.db'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: './server/db/migrations',
    },
  },
};
