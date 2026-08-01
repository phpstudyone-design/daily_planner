// 002_create_plan_template.js - Create plan_template table
exports.up = function (knex) {
  return knex.schema.createTable('plan_template', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().comment('Template name');
    table.jsonb('task_ids').notNullable().comment('Ordered array of main task IDs');
    table.boolean('is_default').notNullable().defaultTo(false).comment('Default template flag');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('plan_template');
};
