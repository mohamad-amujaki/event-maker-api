import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createParticipantSchema } from "../../utils/validation.js";
import {
  getParticipants,
  getParticipanById,
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from "./service.js";
import { prisma } from "../../utils/prisma.js";

const participantRouter = new Hono();

participantRouter.get("/", async (c) => {
  try {
    const participants = await getParticipants();
    const message =
      participants.length === 0
        ? "Belum ada participant"
        : "Daftar participant ditemukan";
    return c.json({
      success: true,
      message,
      count: participants.length,
      data: participants,
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
participantRouter.post(
  "/",
  zValidator("json", createParticipantSchema),
  async (c) => {
    const body = c.req.valid("json");
    try {
      const participant = await createParticipant(body);
      return c.json(
        {
          success: true,
          message: "Participant berhasil ditambahkan",
          data: participant,
        },
        201
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          message: "Participant gagal ditambahkan",
          error: (error as Error).message,
          data: [],
        },
        500
      );
    } finally {
      prisma.$disconnect();
    }
  }
);

participantRouter.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({ message: "Id participant tidak valid" }, 400);
    }
    const participant = await getParticipanById(id);
    if (!participant) {
      return c.json(
        { message: "Data detail participant tidak ditemukan" },
        404
      );
    }
    return c.json({
      message: "Data detail participant ditemukan",
      data: participant,
    });
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

participantRouter.patch("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const { name, email, eventId } = await c.req.json();
    const participant = await updateParticipant(id, { name, email, eventId });
    return c.json({
      success: true,
      message: "Event berhasil diupdate",
      data: participant,
    });
  } catch (error) {
    return c.json({
      success: false,
      message: "Participant gagal diupdate",
      data: [],
      error,
    });
  } finally {
    prisma.$disconnect();
  }
});

participantRouter.delete("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const participant = await deleteParticipant(id);
    return c.json({
      success: true,
      message: "Participant berhasil dihapus",
      data: participant,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Participant tidak ditemukan",
      },
      404
    );

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
export default participantRouter;
