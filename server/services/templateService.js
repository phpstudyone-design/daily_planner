// server/services/templateService.js - Template management
const db = require('../config/db');

async function getAllTemplates() {
  return await db('plan_template').orderBy('id', 'asc');
}

async function getDefaultTemplate() {
  return await db('plan_template').where({ is_default: true }).first();
}

async function getTemplateById(id) {
  return await db('plan_template').where({ id }).first();
}

async function createTemplate({ name, task_ids }) {
  // If this will be default, unset others
  const [newTemplate] = await db('plan_template').insert({ name, task_ids, is_default: false }).returning('*');
  return newTemplate;
}

async function updateTemplate(id, { name, task_ids }) {
  await db('plan_template').where({ id }).update({ name, task_ids });
  return await getTemplateById(id);
}

async function setDefaultTemplate(id) {
  // Unset all defaults first
  await db('plan_template').update({ is_default: false });
  // Set the specified one as default
  await db('plan_template').where({ id }).update({ is_default: true });
  return await getTemplateById(id);
}

async function deleteTemplate(id) {
  await db('plan_template').where({ id }).del();
}

module.exports = {
  getAllTemplates,
  getDefaultTemplate,
  getTemplateById,
  createTemplate,
  updateTemplate,
  setDefaultTemplate,
  deleteTemplate,
};
