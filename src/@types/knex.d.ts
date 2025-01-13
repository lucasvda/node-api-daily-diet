import { knex } from "knex"

declare module "knex/types/tables"

export interface Tables {
    users: {
        id: string,
        name: string,
        email: string,
        created_at: string,
        session_id?: string
    },
    meals: {
        id: string,
        user_id: string,
        meal_name: string,
        description: string,
        created_at: string,
        esta_na_dieta: string
    }
}