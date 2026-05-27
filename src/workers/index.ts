import { Worker } from "bullmq";
import { redisConnection } from "../queues/index.js";
import { instagramJobService } from "../services/instagramJobService.js";
import { scoringService } from "../services/scoringService.js";
import { logger } from "../utils/logger.js";

type BaseJobData = { scrapeJobId?: string };

new Worker<BaseJobData & { targetAccountId?: string }>(
  "post-discovery",
  async (job) => {
    await instagramJobService.markScrapeJobRunning(job.data.scrapeJobId);
    try {
      await instagramJobService.discoverInstagramPosts(job.data.targetAccountId);
      await instagramJobService.markScrapeJobCompleted(job.data.scrapeJobId);
    } catch (error) {
      await instagramJobService.markScrapeJobFailed(job.data.scrapeJobId, error);
      throw error;
    }
  },
  { connection: redisConnection }
);

new Worker<BaseJobData & { postId?: string }>(
  "engagement-fetch",
  async (job) => {
    await instagramJobService.markScrapeJobRunning(job.data.scrapeJobId);
    try {
      await instagramJobService.fetchPostEngagement(job.data.postId);
      await instagramJobService.markScrapeJobCompleted(job.data.scrapeJobId);
    } catch (error) {
      await instagramJobService.markScrapeJobFailed(job.data.scrapeJobId, error);
      throw error;
    }
  },
  { connection: redisConnection }
);

new Worker<BaseJobData & { postId?: string }>(
  "scoring",
  async (job) => {
    await instagramJobService.markScrapeJobRunning(job.data.scrapeJobId);
    try {
      if (job.data.postId) {
        await scoringService.recalculatePostStatus(job.data.postId);
      } else {
        await scoringService.recalculateAllScores();
      }
      await instagramJobService.markScrapeJobCompleted(job.data.scrapeJobId);
    } catch (error) {
      await instagramJobService.markScrapeJobFailed(job.data.scrapeJobId, error);
      throw error;
    }
  },
  { connection: redisConnection }
);

logger.info("Workers started");
