import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { EventStore } from "@/core/EventStore";

describe("EventStore", () => {
  let logPath: string;
  beforeEach(() => {
    logPath = path.join(
      os.tmpdir(),
      `events-test-${Date.now()}-${Math.random()}.log`,
    );
  });

  afterEach(() => {
    fs.rmSync(logPath, { force: true });
  });

  it("writes an event and reads the same one back", async () => {
    const store = new EventStore(logPath);
    await store.recover();

    const event = { id: "id-1", msg: "hello" };
    await store.append(event.id, JSON.stringify(event));

    const raw = await store.readRaw("id-1");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(event);
  });

  it("keeps non-ascii text intact", async () => {
    const store = new EventStore(logPath);
    await store.recover();

    const event = { id: "u-1", msg: "héllo, café, konnichiwa, 日本語" };
    await store.append(event.id, JSON.stringify(event));

    const raw = await store.readRaw("u-1");
    expect(JSON.parse(raw!)).toEqual(event);
  });

  it("does not mix events up when they are different lengths", async () => {
    const store = new EventStore(logPath);
    await store.recover();

    const events = [
      { id: "a", msg: "short" },
      { id: "b", msg: "a noticeably longer message than the others" },
      { id: "c", msg: "tiny" },
    ];

    for (const event of events) {
      await store.append(event.id, JSON.stringify(event));
    }

    for (const event of events) {
      const raw = await store.readRaw(event.id);
      expect(JSON.parse(raw!)).toEqual(event);
    }
  });

  it("rebuilds everything from the log when a fresh store starts up", async () => {
    const firstRun = new EventStore(logPath);
    await firstRun.recover();

    const events = [
      { id: "r-1", msg: "alpha" },
      { id: "r-2", msg: "bravo with an accent: beta" },
      { id: "r-3", msg: "charlie" },
    ];

    for (const event of events) {
      await firstRun.append(event.id, JSON.stringify(event));
    }

    const secondRun = new EventStore(logPath);
    const recovered = await secondRun.recover();

    expect(recovered).toBe(events.length);

    for (const event of events) {
      const raw = await secondRun.readRaw(event.id);
      expect(JSON.parse(raw!)).toEqual(event);
    }
  });

  it("returns null when the id was never stored", async () => {
    const store = new EventStore(logPath);
    await store.recover();

    const raw = await store.readRaw("never-written");
    expect(raw).toBeNull();
  });

  it("reports a total and byte count that match what is on disk", async () => {
    const store = new EventStore(logPath);
    await store.recover();

    const events = [
      { id: "s-1", msg: "one" },
      { id: "s-2", msg: "two" },
    ];

    for (const event of events) {
      await store.append(event.id, JSON.stringify(event));
    }

    const stats = store.stats();
    expect(stats.total).toBe(events.length);
    expect(stats.bytes).toBe(fs.statSync(logPath).size);
  });
});
