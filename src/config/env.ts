import dotenv from "dotenv";
import path from "path";

dotenv.config();

function required(
  value: string | undefined,
  name: string,
  fallback?: string,
): string {
  const result = value ?? fallback;
  if (result === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return result;
}

export const env = {
  PORT: Number(required(process.env.PORT, "PORT", "3000")),
  LOG_PATH: path.resolve(
    process.cwd(),
    required(process.env.LOG_PATH, "LOG_PATH", "data/events.log"),
  ),
  LOG_LEVEL: required(process.env.LOG_LEVEL, "LOG_LEVEL", "info"),
} as const;
