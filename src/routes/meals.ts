import { FastifyInstance } from "fastify"
import { knex } from "../database"
import { z } from "zod"
import { randomUUID } from "node:crypto"
import { getUserId } from "../middlewares/get-user-id";

export async function mealsRoutes(app: FastifyInstance) {

    app.get("/metrics", async (request, reply) => {

        const userId = await getUserId(request, reply)

        const count = await knex("meals")
            .where("user_id", userId)
            .count("id", { as: "count" }).first()

        const countOnDiet = await knex("meals")
            .where({
                "user_id": userId,
                "on_diet": "Yes"
            })
            .count("id", { as: "count_on_diet" }).first()

        const countNotOnDiet = await knex("meals")
            .where({
                "user_id": userId,
                "on_diet": "No"
            })
            .count("id", { as: "count_not_on_diet" }).first()

        const totalMeals = await knex('meals')
            .where({ "user_id": userId })
            .orderBy('date_and_time', 'desc')            

        const { bestOnDietSequence } = totalMeals.reduce(
            (acc, meal) => {
                if (meal.on_diet === "Yes") {
                    acc.currentSequence += 1
                } else {
                    acc.currentSequence = 0
                }

                if (acc.currentSequence > acc.bestOnDietSequence) {
                    acc.bestOnDietSequence = acc.currentSequence
                }

                return acc
            },
            { bestOnDietSequence: 0, currentSequence: 0 },
        )

        const metrics = {
            count: count?.count,
            count_on_diet: countOnDiet?.count_on_diet,
            count_not_on_diet: countNotOnDiet?.count_not_on_diet,
            best_on_diet_sequence: bestOnDietSequence
        }
        
        return { metrics }
    })

    app.get("/", async (request, reply) => {

        const userId = await getUserId(request, reply)

        const meals = await knex("meals")
            .where("user_id", userId)
            .select()

        return { meals }
    })

    app.get("/:id", async (request, reply) => {

        const mealsParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = mealsParamsSchema.parse(request.params)

        const userId = await getUserId(request, reply)

        const meals = await knex("meals")
            .where({
                "user_id": userId,
                "id": id
            })
            .select()
            .first()

        return { meals }
    })

    app.post("/", async (request, reply) => {

        const mealSchema = z.object({
            meal_name: z.string(),
            description: z.string(),
            date_and_time: z.string().datetime(),
            on_diet: z.enum(["Yes", "No"])
        })

        const { meal_name, description, date_and_time, on_diet } = mealSchema.parse(request.body)

        const userId = await getUserId(request, reply)

        console.log(userId);


        await knex("meals").insert({
            id: randomUUID(),
            user_id: userId,
            meal_name,
            description,
            date_and_time,
            on_diet
        })

        return reply.status(201).send()
    })

    app.put("/:id", async (request, reply) => {

        const mealsParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = mealsParamsSchema.parse(request.params)

        const mealSchema = z.object({
            meal_name: z.string().optional(),
            description: z.string().optional(),
            date_and_time: z.string().datetime().optional(),
            on_diet: z.enum(["Yes", "No"]).optional()
        })

        const { meal_name, description, date_and_time, on_diet } = mealSchema.parse(request.body)

        const userId = await getUserId(request, reply)

        await knex("meals")
            .where({
                "user_id": userId,
                "id": id
            })
            .update({
                meal_name,
                description,
                date_and_time,
                on_diet
            })

        return reply.status(204).send({
            sucess: "Record updated succesfully."
        })
    })

    app.delete("/:id", async (request, reply) => {

        const mealsParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = mealsParamsSchema.parse(request.params)

        const userId = await getUserId(request, reply)

        await knex("meals")
            .where({
                "user_id": userId,
                "id": id
            })
            .delete()

        return reply.status(204).send({
            sucess: "Record deleted succesfully."
        })
    })
}