import { serve } from "@hono/node-server";
import { Hono } from "hono";
import eventRouter from "./modules/event/router.js";
import participantRouter from "./modules/participant/router.js";
import { prisma } from "./utils/prisma.js";
const app = new Hono();
app.get("/", (c) => {
    return c.text("Hello Hono!");
});
app.route("/events", eventRouter);
app.route("/participants", participantRouter);
serve({
    fetch: app.fetch,
    port: 8000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
