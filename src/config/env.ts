import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  INSTAGRAM_STORAGE_STATE: z.string().default("./storage_state.json"),
  SCHEDULER_DISCOVER_CRON_MS: z.coerce.number().default(15 * 60 * 1000),
  SCHEDULER_ENGAGEMENT_CRON_MS: z.coerce.number().default(20 * 60 * 1000),
  SCHEDULER_SCORING_CRON_MS: z.coerce.number().default(10 * 60 * 1000)
});

export const env = schema.parse(process.env);
