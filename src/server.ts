import { buildApp } from "@/app";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

async function start(): Promise<void> {
  const { app, store } = buildApp();
  await store.recover();

  app.listen(env.PORT, () => {
    logger.info(`Event store listening on port ${env.PORT}`);
  });
}

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
