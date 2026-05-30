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
  INSTAGRAM_DISCOVERY_POST_LIMIT: z.coerce.number().int().positive().default(12),
  AUTO_FETCH_POST_LIMIT: z.coerce.number().int().positive().default(3),
  SCRAPE_DELAY_MS: z.coerce.number().int().min(0).default(5000),
  SCRAPE_DEBUG_ENABLED: z.coerce.boolean().default(true),
  SCRAPE_DEBUG_DIR: z.string().default("./debug"),
  SCHEDULER_DISCOVER_CRON_MS: z.coerce.number().default(15 * 60 * 1000),
  SCHEDULER_ENGAGEMENT_CRON_MS: z.coerce.number().default(20 * 60 * 1000),
  SCHEDULER_SCORING_CRON_MS: z.coerce.number().default(10 * 60 * 1000)
});

export const env = schema.parse(process.env);
