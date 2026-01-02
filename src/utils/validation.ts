import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1),
});

export const createParticipantSchema = z.object({
  name: z.string().min(1),
});
