import { z } from "zod";

export const callTurnSchema = z.object({
  topic: z.string().min(1, "Topik wajib diisi"),
  history: z.array(
    z.object({
      role: z.enum(["assistant", "user"]),
      content: z.string(),
    })
  ),
  studentMessage: z.string(),
});

export const callEndSchema = z.object({
  topic: z.string().min(1),
  durationSeconds: z.number().nonnegative(),
  transcript: z.string().optional(),
  moduleId: z.string().optional(),
});

export type CallTurnInput = z.infer<typeof callTurnSchema>;
export type CallEndInput = z.infer<typeof callEndSchema>;
