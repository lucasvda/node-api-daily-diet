import { knex } from "knex"

declare module "knex/types/tables"

export interface Tables {
    users: {
        id: string,
        session_id?: string,
        name: string,
        email: string,
        created_at: string        
    },
    meals: {
        id: string,
        user_id: string,
        meal_name: string,
        description?: string,
        date_and_time: string,
        on_diet: string,
        created_at: string        
    }
}