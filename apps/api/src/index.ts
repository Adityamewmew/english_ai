import { app } from "./app";
import { env } from "./core/config/env";

const server = app.listen(env.PORT);

console.log(
  `🚀 Elysia Backend running at http://${server.server?.hostname}:${server.server?.port}`
);
