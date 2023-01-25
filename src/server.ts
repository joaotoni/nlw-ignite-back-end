import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./lib/prisma";
import { appRoutes } from "./routes";
import  serverless from "serverless-http"

/**
 * Método HTTP: Get(buscar informção),
 * Post(uma rota que vai criar alguma coisa),
 * Put(alguma rota que vai atualizar algum recruso por completo),
 * Patch(Quando vai ser atualizado uma informação especifica de algum recurso),
 *  Delete(quando deleta algum recurso do back-end)
 */
const app = Fastify();

app.register(cors);
app.register(appRoutes);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server running");
  });

  // module.exports.handler = serverless(app)
