// server/services/taskPoolService.js - Task pool management
const db = require('../config/db');

async function getAllTasks() {
  return await db('task_pool').orderBy('id', 'asc');
}

async function getTaskById(id) {
  return await db('task_pool').where({ id }).first();
}

async function createTask({ name, task_type }) {
  const [newTask] = await db('task_pool').insert({ name, task_type }).returning('*');
  return newTask;
}

async function updateTask(id, { name, task_type }) {
  await db('task_pool').where({ id }).update({ name, task_type });
  return await getTaskById(id);
}

async function deleteTask(id) {
  await db('task_pool').where({ id }).del();
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
