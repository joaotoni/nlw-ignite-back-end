"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const routes_1 = require("./routes");
/**
 * Método HTTP: Get(buscar informção),
 * Post(uma rota que vai criar alguma coisa),
 * Put(alguma rota que vai atualizar algum recruso por completo),
 * Patch(Quando vai ser atualizado uma informação especifica de algum recurso),
 *  Delete(quando deleta algum recurso do back-end)
 */
const app = (0, fastify_1.default)();
app.register(cors_1.default);
app.register(routes_1.appRoutes);
app
    .listen({
    port: 3333,
})
    .then(() => {
    console.log("HTTP Server running");
});
// module.exports.handler = serverless(app)
