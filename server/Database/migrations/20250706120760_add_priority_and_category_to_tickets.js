/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('tickets', table => {
        table
        .enu('priority', ['Low', 'Medium', 'High'], {
            useNative: true,
            enumName: 'ticket_priority'
        })
        .nullable();
        table
        .enu('category', ['Bug', 'Feature', 'Task'], {
            useNative: true,
            enumName: 'ticket_category'
        })
        .nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .alterTable('tickets', table => {
            table.dropColumn('priority');
            table.dropColumn('category');
        })
        .then(() => knex.schema.raw('DROP TYPE IF EXISTS ticket_priority'))
        .then(() => knex.schema.raw('DROP TYPE IF EXISTS ticket_category'));
};