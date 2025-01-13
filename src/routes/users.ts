import { FastifyInstance } from "fastify"
import { knex } from "../database"
import { randomUUID } from "node:crypto"
import { z } from "zod"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function usersRoutes(app: FastifyInstance) {

    app.addHook("preHandler", checkSessionIdExists)

    app.get(
        "/",
        async (request) => {
            const { sessionId } = request.cookies

            const users = await knex("users").where("session_id", sessionId).select()

            return { users }
        })


    app.post(
        "/",
        async (request, reply) => {

            const usersSchema = z.object({
                name: z.string(),
                email: z.string()
            })

            const { name, email } = usersSchema.parse(request.body)

            let sessionId = request.cookies.sessionId

            if (!sessionId) {
                sessionId = randomUUID()

                reply.cookie("sessionId", sessionId, {
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                })
            }

            await knex("users").insert({
                id: randomUUID(),
                name: name,
                email: email,
                session_id: sessionId
            })

            return reply.status(201).send()
        })
}