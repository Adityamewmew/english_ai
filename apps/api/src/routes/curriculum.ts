import { Elysia, t } from "elysia";
import { curriculumService } from "../services/curriculum.service";

export const curriculumRoutes = new Elysia({ prefix: "/api/curriculum" })
  .get("/", async () => {
    return await curriculumService.getAll();
  })
  .get("/modules", async () => {
    return await curriculumService.getAll();
  })
  .get(
    "/:id",
    async ({ params }) => {
      return await curriculumService.getById(params.id);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
