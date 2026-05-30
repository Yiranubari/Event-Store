// src/app.ts
import express, { Application } from "express";
import { EventStore } from "@/core/EventStore";
import { EventsService } from "@/modules/events/events.service";
import { EventsController } from "@/modules/events/events.controller";
import { createEventsRouter } from "@/modules/events/events.routes";
import { errorHandler } from "@/middleware/error-handler";
import { env } from "@/config/env";

export function buildApp(): { app: Application; store: EventStore } {
  const store = new EventStore(env.LOG_PATH);
  const service = new EventsService(store);
  const controller = new EventsController(service);

  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/events", createEventsRouter(controller));

  app.use(errorHandler);

  return { app, store };
}
