import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createParticipantSchema } from "../../utils/validation.js";
import { prisma } from "../../utils/prisma.js";
import { error } from "console";

const participantRouter = new Hono();

participantRouter.get("/", async (c) => {
  try {
    const participants = await prisma.participant.findMany({
      include: {
        event: {
          select: { title: true, date: true, location: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (participants.length === 0) {
      return c.json({
        message: "Belum ada peserta yang terdaftar dalam event",
        data: [],
      });
    }

    return c.json({
      count: participants.length,
      data: participants,
    });
  } catch (error) {}
  return c.json(
    {
      message: "Terjadi kesalahan",
      error,
    },
    500
  );
});

participantRouter.post(
  "/",
  zValidator("json", createParticipantSchema),
  (c) => {
    const body = c.req.valid("json");
    return c.json({ message: "Create Participant succes" }, 201);
  }
);
export default participantRouter;
