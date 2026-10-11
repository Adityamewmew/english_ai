import { app } from "./server";
import { env } from "./config/env";

const server = app.listen(env.PORT);

console.log(
  `🚀 EDDY'S AI Elysia Backend running at http://${server.server?.hostname}:${server.server?.port}`
);
console.log(
  `📚 Swagger documentation available at http://${server.server?.hostname}:${server.server?.port}/swagger`
);
