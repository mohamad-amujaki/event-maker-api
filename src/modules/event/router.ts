import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createEventSchema } from "../../utils/validation.js";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./service.js";

const eventRouter = new Hono();

eventRouter.get("/", async (c) => {
  try {
    const events = await getEvents();
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
  }
});
eventRouter.post("/", zValidator("json", createEventSchema), async (c) => {
  const body = c.req.valid("json");
  try {
    const event = await createEvent(body);
    return c.json(
      {
        success: true,
        message: "Event berhasil ditambahkan",
        data: event,
      },
      201
    );
  } catch (error) {
    if ((error as Error).message === "Invalid date format") {
      return c.json({ message: "Invalid date format" }, 400);
    }
    return c.json(
      {
        success: false,
        message: "Event gagal ditambahkan",
        error: (error as Error).message,
        data: [],
      },
      500
    );
  }
});

eventRouter.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ message: "Id event tidak valid" }, 400);
    }
    const event = await getEventById(id);
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
  }
});

eventRouter.patch("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const { title, description, date, location } = await c.req.json();
    const event = await updateEvent(id, { title, description, date, location });
    return c.json({
      success: true,
      message: "Event berhasil diupdate",
      data: event,
    });
  } catch (error) {
    if ((error as Error).message === "Invalid date format") {
      return c.json({ message: "Invalid date format" }, 400);
    }
    return c.json({
      success: false,
      message: "Event gagal didata",
      data: [],
      error,
    });
  }
});

eventRouter.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const event = await deleteEvent(id);
    return c.json({
      success: true,
      message: "Event berhasil dihapus",
      data: event,
    });
  } catch (error) {
    if ((error as any).code === "P2025") {
      return c.json(
        {
          success: false,
          message: "Event tidak ditemukan",
        },
        404
      );
    }
    return c.json(
      {
        success: false,
        message: "Terjadi kesalahan",
        error,
      },
      500
    );
  }
});
export default eventRouter;
