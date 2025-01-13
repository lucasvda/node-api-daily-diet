import { FastifyReply, FastifyRequest } from "fastify";

export async function checkSessionIdExists(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId } = request.cookies
    const { method } = request

    if (!sessionId && method !== "POST") {
        return reply.status(401).send({
            error: "Unauthorized"
        })
    }
}