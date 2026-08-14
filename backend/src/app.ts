import { Hono } from "hono";

export const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

// Per-feature routers (auth, orders, payments) are mounted here as they land,
// e.g. app.route("/orders", ordersRouter), keeping routes out of a single entry point.
