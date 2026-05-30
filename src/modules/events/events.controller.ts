import { Request, Response, NextFunction } from "express";
import { EventsService } from "./events.service";
export class EventsController {
  #service: EventsService;

  constructor(service: EventsService) {
    this.#service = service;
  }

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const event = await this.#service.create(req.body);
      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const event = await this.#service.getById(req.params.id);
      res.status(200).json(event);
    } catch (err) {
      next(err);
    }
  };

  getStats = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      res.status(200).json(this.#service.getStats());
    } catch (err) {
      next(err);
    }
  };
}
