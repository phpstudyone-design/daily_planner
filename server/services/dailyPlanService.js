// server/services/dailyPlanService.js - Core business logic for daily plan generation
const db = require('../config/db');

/**
 * Normalize a plan record: ensure plan_date is YYYY-MM-DD string and plan_items is array
 */
function normalizePlan(plan) {
  if (!plan) return plan;

  // Use the text-cast plan_date if available (from getAllPlans), otherwise fall back to parsing
  let planDate = plan.plan_date_text || plan.plan_date;
  if (planDate instanceof Date) {
    planDate = planDate.toISOString().split('T')[0];
  } else if (typeof planDate === 'string' && planDate.includes('T')) {
    planDate = planDate.split('T')[0];
  }

  // Ensure plan_items is an array
  let planItems = plan.plan_items;
  if (typeof planItems === 'string') {
    try {
      planItems = JSON.parse(planItems);
    } catch {
      planItems = [];
    }
  }

  // Build clean object with only the columns we want
  const result = {
    id: plan.id,
    plan_date: planDate,
    plan_items: planItems,
    created_at: plan.created_at,
    updated_at: plan.updated_at,
  };

  return result;
}

/**
 * Get or create daily plan for a given date.
 * If no plan exists, auto-generate from default template.
 */
async function getOrCreateDailyPlan(date) {
  let plan = await db('daily_plan')
    .select('*', db.raw('plan_date::text as plan_date_text'))
    .where({ plan_date: date })
    .first();

  if (!plan) {
    plan = await generateDailyPlan(date);
  }

  return normalizePlan(plan);
}

/**
 * Generate daily plan from default template.
 * Algorithm: between every two adjacent main tasks, randomly insert a relax task.
 * Also append one random relax task at the end.
 */
async function generateDailyPlan(date) {
  // Get default template
  const template = await db('plan_template').where({ is_default: true }).first();

  if (!template) {
    throw new Error('No default template found. Please create one in admin.');
  }

  // Get main tasks from template
  const taskIds = template.task_ids;
  const mainTasks = await db('task_pool').whereIn('id', taskIds);

  // Order main tasks according to template order
  const orderedMainTasks = taskIds.map(id => mainTasks.find(t => t.id === id));

  // Get all relax tasks
  const relaxTasks = await db('task_pool').where({ task_type: 'relax' });

  if (relaxTasks.length === 0) {
    throw new Error('No relax tasks available. Please add some in admin.');
  }

  // Build plan items: main -> relax -> main -> relax ... -> main -> relax(end)
  const planItems = [];
  let orderIndex = 0;

  for (let i = 0; i < orderedMainTasks.length; i++) {
    // Add main task
    planItems.push({
      id: orderedMainTasks[i].id,
      name: orderedMainTasks[i].name,
      type: orderedMainTasks[i].task_type,
      done: false,
      order: orderIndex++,
    });

    // After each main task (including the last one), insert a random relax task
    const randomRelax = relaxTasks[Math.floor(Math.random() * relaxTasks.length)];
    planItems.push({
      id: randomRelax.id,
      name: randomRelax.name,
      type: randomRelax.task_type,
      done: false,
      order: orderIndex++,
    });
  }

  // Create daily plan record
  const [newPlan] = await db('daily_plan').insert({
    plan_date: date,
    plan_items: JSON.stringify(planItems),
  }).returning('*');

  return normalizePlan(newPlan);
}

/**
 * Get daily plan by date
 */
async function getDailyPlan(date) {
  const plan = await db('daily_plan')
    .select('*', db.raw('plan_date::text as plan_date_text'))
    .where({ plan_date: date })
    .first();

  return plan ? normalizePlan(plan) : null;
}

/**
 * Update daily plan items
 */
async function updateDailyPlanItems(date, planItems) {
  const serializedItems = typeof planItems === "string" ? planItems : JSON.stringify(planItems);
  return await db('daily_plan')
    .where({ plan_date: date })
    .update({ plan_items: serializedItems });
}

/**
 * Get all historical plans (for dashboard)
 */
async function getAllPlans() {
  const plans = await db('daily_plan')
    .select(
      'daily_plan.*',
      db.raw('plan_date::text as plan_date_text')
    )
    .orderByRaw('daily_plan.plan_date DESC');

  return plans.map(normalizePlan);
}

module.exports = {
  getOrCreateDailyPlan,
  generateDailyPlan,
  getDailyPlan,
  updateDailyPlanItems,
  getAllPlans,
};
