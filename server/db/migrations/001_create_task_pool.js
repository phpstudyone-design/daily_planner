// 001_create_task_pool.js - Create task_pool table
exports.up = function (knex) {
  return knex.schema.createTable('task_pool', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().comment('Task name');
    table.enum('task_type', ['main', 'relax']).notNullable().defaultTo('main').comment('main=main task, relax=leisure task');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('task_pool');
};
