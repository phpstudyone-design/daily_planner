// 003_create_daily_plan.js - Create daily_plan table
exports.up = function (knex) {
  return knex.schema.createTable('daily_plan', (table) => {
    table.increments('id').primary();
    table.date('plan_date').notNullable().unique();
    table.text('plan_items').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('daily_plan');
};
