import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

    await knex.schema.createTable("meals", (table) => {
        table.uuid("id").primary(),
            table.uuid("user_id").notNullable(),
            table.text("meal_name").notNullable(),
            table.text("description"),
            table.timestamp("date_and_time").notNullable(),
            table.enum("on_diet", ["Yes","No"]).notNullable(),
            table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable(),
            table
                .foreign("user_id")
                .references("id")
                .inTable("users")
                .onDelete("CASCADE")
                .onUpdate("CASCADE")
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("meals")
}

