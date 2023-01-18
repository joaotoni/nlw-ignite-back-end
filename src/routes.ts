import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {
  app.get("/habits", async (request) => {
    // itens requisitados para busca de informação: title e weekDays

    const { title, weekDays } = request.body;
  });
}
