import { z } from "zod";

export const submitPlacementSchema = z.object({
  answers: z.record(z.string()),
  writingText: z.string().optional(),
  speakingTranscript: z.string().optional(),
});

export type SubmitPlacementInput = z.infer<typeof submitPlacementSchema>;
