import fs from "fs";
import { IndexEntry, StoreStats } from "@/types/event";
import { logger } from "@/utils/logger";
import readline from "readline";

export class EventStore {
  #filePath: string;
  #index: Map<string, IndexEntry>;
  #byteCount: number;
  #writeLock: Promise<void> = Promise.resolve();

  constructor(filePath: string) {
    this.#filePath = filePath;
    this.#index = new Map();
    this.#byteCount = 0;
  }

  recover = async (): Promise<number> => {
    if (!fs.existsSync(this.#filePath)) {
      logger.info(
        "Event log not found — starting with an empty store. Recovered 0 events.",
      );
      return 0;
    }

    const stream = fs.createReadStream(this.#filePath);
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let offset = 0;
    let count = 0;

    for await (const line of rl) {
      if (line.length === 0) continue;

      const length = Buffer.byteLength(line);
      const { id } = JSON.parse(line) as { id: string };

      this.#index.set(id, { offset, length });

      offset += length + 1;
      count++;
    }

    this.#byteCount = offset;
    logger.info(`Recovered ${count} events from the log.`);
    return count;
  };

  append = async (id: string, line: string): Promise<IndexEntry> => {
    const run = this.#writeLock.then(async () => {
      const offset = this.#byteCount;
      const length = Buffer.byteLength(line);

      await fs.promises.appendFile(this.#filePath, line + "\n");

      const entry: IndexEntry = { offset, length };
      this.#index.set(id, entry);
      this.#byteCount += length + 1;

      return entry;
    });

    this.#writeLock = run.then(
      () => undefined,
      () => undefined,
    );

    return run;
  };

  readRaw = async (id: string): Promise<string | null> => {
    const entry = this.#index.get(id);
    if (!entry) return null;

    const handle = await fs.promises.open(this.#filePath, "r");
    try {
      const buffer = Buffer.alloc(entry.length);
      await handle.read(buffer, 0, entry.length, entry.offset);
      return buffer.toString("utf8");
    } finally {
      await handle.close();
    }
  };

  stats = (): StoreStats => {
    return {
      total: this.#index.size,
      bytes: this.#byteCount,
    };
  };
}
