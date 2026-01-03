import type { title } from "process";
import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().date(),
  location: z.string().min(1),
});

export const createParticipantSchema = z.object({
  name: z.string().min(1),
});
