import { prisma } from "./../../utils/prisma.js";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createEventSchema } from "../../utils/validation.js";

const eventRouter = new Hono();

eventRouter.get("/", async (c) => {
  //   const events = [
  //     {
  //       id: 1,
  //       title: "Event A",
  //       description: "Detail Event A",
  //       location: "Zoom",
  //       createdAt: "2025-01-02",
  //     },
  //   ];
  //   console.log(events);
  try {
    const events = await prisma.event.findMany({
      include: {
        participants: {
          select: { name: true, email: true },
        },
      },
    });
    if (events.length === 0) {
      return c.json({
        message: "Belum ada event yang terdaftar",
        data: events,
      });
    }
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan",
        error,
      },
      500
    );
  }
});
eventRouter.post("/", zValidator("json", createEventSchema), (c) => {
  const body = c.req.valid("json");
  return c.json({ message: "Create Event success" }, 201);
});
export default eventRouter;
