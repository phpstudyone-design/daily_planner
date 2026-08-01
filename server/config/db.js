// server/config/db.js - Database connection
const knex = require('knex');
const knexConfig = require('../../knexfile');

require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[env]);

module.exports = db;
