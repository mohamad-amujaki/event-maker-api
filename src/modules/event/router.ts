import { prisma } from "./../../utils/prisma.js";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createEventSchema } from "../../utils/validation.js";
import { fromZonedTime } from "date-fns-tz";

const eventRouter = new Hono();

eventRouter.get("/", async (c) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        participants: {
          select: { name: true, email: true },
        },
      },
    });

    return c.json({
      success: true,
      message: "Daftar event ditemukan",
      count: events.length,
      data: events,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Terjadi kesalahan",
        error,
      },
      500
    );
  } finally {
    prisma.$disconnect();
  }
});
eventRouter.post("/", zValidator("json", createEventSchema), async (c) => {
  const body = c.req.valid("json");
  try {
    // Parse date as Asia/Jakarta timezone and convert to UTC for storage
    const date = fromZonedTime(body.date, "Asia/Jakarta");
    if (isNaN(date.getTime())) {
      return c.json({ message: "Invalid date format" }, 400);
    }
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        date: date,
        location: body.location,
      },
    });
    return c.json(
      {
        success: true,
        message: "Event berhasil ditambahkan",
        data: event,
      },
      201
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Event gagal ditambahkan",
        error: (error as Error).message,
        data: [],
      },
      500
    );
  } finally {
    prisma.$disconnect();
  }
});

eventRouter.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ message: "Id event tidak valid" }, 400);
    }
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      return c.json({ message: "Data detail event tidak ditemukan" }, 404);
    }
    return c.json({ message: "Data detail event ditemukan", data: event });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Terjadi kesalahan",
        error: (error as Error).message,
        data: [],
      },
      500
    );
  } finally {
    prisma.$disconnect();
  }
});

eventRouter.patch("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const { title, description, date, location } = await c.req.json();
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(date && { date }),
        ...(location && { location }),
      },
      include: {
        participants: {
          select: { name: true },
        },
      },
    });

    return c.json({
      success: true,
      message: "Event berhasil diupdate",
      data: event,
    });
  } catch (error) {
    return c.json({
      success: false,
      message: "Event gagal didata",
      data: [],
      error,
    });
  } finally {
    prisma.$disconnect();
  }
});

eventRouter.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const event = await prisma.event.delete({ where: { id } });

    return c.json({
      success: true,
      message: "Event berhasil dihapus",
      data: event,
    });
  } catch (error) {
    if (error) {
      return c.json(
        {
          success: false,
          message: "Event tidak ditemukan",
        },
        404
      );
    }
    throw error;
  } finally {
    prisma.$disconnect();
  }
});
export default eventRouter;
