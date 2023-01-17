import Fastify from "fastify";

const app = Fastify();

/**
 * Método HTTP: Get(buscar informção),
 * Post(uma rota que vai criar alguma coisa),
 * Put(alguma rota que vai atualizar algum recruso por completo),
 * Patch(Quando vai ser atualizado uma informação especifica de algum recurso),
 *  Delete(quando deleta algum recurso do back-end)
 */

app.get("/", () => {
  return "Hello World";
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server runing");
  });
