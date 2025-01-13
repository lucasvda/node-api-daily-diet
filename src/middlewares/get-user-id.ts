import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database";

export async function getUserId(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId } = request.cookies

    const userId = (await knex("users").where("session_id", sessionId).select("id").first()).id   

    if (!userId) {
        return reply.status(404).send({
            error: "User not found."
        })
    } else {               
        return userId
    }

}