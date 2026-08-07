// 002_create_plan_template.js - Create plan_template table
exports.up = function (knex) {
  return knex.schema.createTable('plan_template', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('task_ids').notNullable();
    table.boolean('is_default').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('plan_template');
};
