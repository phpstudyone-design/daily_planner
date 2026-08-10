// server/services/templateService.js - Template management
const db = require('../config/db');

/**
 * Normalize a template record: parse task_ids from JSON string to array
 */
function normalizeTemplate(template) {
  if (!template) return template;

  let taskIds = template.task_ids;
  if (typeof taskIds === 'string') {
    try {
      taskIds = JSON.parse(taskIds);
    } catch {
      taskIds = [];
    }
  }

  return {
    ...template,
    task_ids: Array.isArray(taskIds) ? taskIds : [],
  };
}

async function getAllTemplates() {
  const templates = await db('plan_template').orderBy('id', 'asc');
  return templates.map(normalizeTemplate);
}

async function getDefaultTemplate() {
  const template = await db('plan_template').where({ is_default: true }).first();
  return normalizeTemplate(template);
}

async function getTemplateById(id) {
  const template = await db('plan_template').where({ id }).first();
  return normalizeTemplate(template);
}

function serializeTaskIds(task_ids) {
  if (!task_ids) return JSON.stringify([]);
  if (typeof task_ids === 'string') return task_ids;
  return JSON.stringify(task_ids);
}

async function createTemplate({ name, task_ids }) {
  const [newTemplate] = await db('plan_template')
    .insert({ name, task_ids: serializeTaskIds(task_ids), is_default: false })
    .returning('*');
  return normalizeTemplate(newTemplate);
}

async function updateTemplate(id, { name, task_ids }) {
  await db('plan_template').where({ id }).update({ name, task_ids: serializeTaskIds(task_ids) });
  return await getTemplateById(id);
}

async function setDefaultTemplate(id) {
  await db('plan_template').update({ is_default: false });
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
