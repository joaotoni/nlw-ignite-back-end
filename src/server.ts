import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";

/**
 * Método HTTP: Get(buscar informção),
 * Post(uma rota que vai criar alguma coisa),
 * Put(alguma rota que vai atualizar algum recruso por completo),
 * Patch(Quando vai ser atualizado uma informação especifica de algum recurso),
 *  Delete(quando deleta algum recurso do back-end)
 */
const app = Fastify();
const prisma = new PrismaClient();

app.register(cors);

app.get("/", async () => {
  const habits = await prisma.habit.findMany();

  return habits;
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server runing");
  });
