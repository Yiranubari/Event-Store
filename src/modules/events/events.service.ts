import { randomUUID } from "crypto";
import { EventStore } from "@/core/EventStore";
import { StoredEvent, StoreStats } from "@/types/event";
import { logger } from "@/utils/logger";
import { NotFoundError } from "@/exceptions/app-exceptions";

export class EventsService {
  #store: EventStore;

  constructor(store: EventStore) {
    this.#store = store;
  }

  create = async (body: Record<string, unknown>): Promise<StoredEvent> => {
    const event: StoredEvent = {
      ...body,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const line = JSON.stringify(event);
    await this.#store.append(event.id, line);
    logger.info(`Event stored: ${event.id}`);
    return event;
  };

  getById = async (id: string): Promise<StoredEvent> => {
    const raw = await this.#store.readRaw(id);
    if (!raw) {
      throw new NotFoundError();
    }
    return JSON.parse(raw) as StoredEvent;
  };

  getStats = (): StoreStats => {
    return this.#store.stats();
  };
}
