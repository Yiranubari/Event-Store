import { Router } from "express";
import { EventsController } from "./events.controller";

export function createEventsRouter(controller: EventsController): Router {
  const router = Router();

  router.post("/", controller.create);
  router.get("/stats", controller.getStats);
  router.get("/:id", controller.getOne);

  return router;
}
