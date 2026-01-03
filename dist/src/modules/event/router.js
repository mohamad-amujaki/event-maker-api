import { prisma } from "./../../utils/prisma.js";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createEventSchema } from "../../utils/validation.js";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
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
        // Convert dates from UTC to Asia/Jakarta timezone for display
        const eventsWithJakartaTime = events.map((event) => ({
            ...event,
            date: toZonedTime(event.date, "Asia/Jakarta"),
        }));
        const message = eventsWithJakartaTime.length === 0
            ? "Belum ada event yang terdaftar"
            : "Events retrieved successfully";
        return c.json({
            message,
            data: eventsWithJakartaTime,
        });
    }
    catch (error) {
        return c.json({
            message: "Terjadi kesalahan",
            error,
        }, 500);
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
        return c.json({ message: "Create Event success", data: event }, 201);
    }
    catch (error) {
        return c.json({ message: "Error creating event", error: error.message }, 500);
    }
});
export default eventRouter;
