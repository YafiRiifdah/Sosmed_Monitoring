import { Queue, type ConnectionOptions } from "bullmq";
import { env } from "../config/env.js";

export const redisConnection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null
};

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 5000 },
  removeOnComplete: 100,
  removeOnFail: 200
};

export const postDiscoveryQueue = new Queue("post-discovery", {
  connection: redisConnection,
  defaultJobOptions
});

export const engagementFetchQueue = new Queue("engagement-fetch", {
  connection: redisConnection,
  defaultJobOptions
});

export const scoringQueue = new Queue("scoring", {
  connection: redisConnection,
  defaultJobOptions
});
