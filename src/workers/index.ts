import { Worker } from "bullmq";
import { redisConnection } from "../queues/index.js";
import { instagramJobService } from "../services/instagramJobService.js";
import { scoringService } from "../services/scoringService.js";
import { logger } from "../utils/logger.js";

type BaseJobData = { scrapeJobId?: string };

new Worker<BaseJobData & { targetAccountId?: string }>(
  "post-discovery",
  async (job) => {
    logger.info("Post discovery job started", { jobId: job.id, data: job.data });
    await instagramJobService.markScrapeJobRunning(job.data.scrapeJobId);
    try {
      await instagramJobService.discoverInstagramPosts(job.data.targetAccountId);
      await instagramJobService.markScrapeJobCompleted(job.data.scrapeJobId);
      logger.info("Post discovery job completed", { jobId: job.id });
    } catch (error) {
      await instagramJobService.markScrapeJobFailed(job.data.scrapeJobId, error);
      logger.error("Post discovery job failed", {
        jobId: job.id,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  },
  { connection: redisConnection }
);

new Worker<BaseJobData & { postId?: string }>(
  "engagement-fetch",
  async (job) => {
    logger.info("Engagement fetch job started", { jobId: job.id, data: job.data });
    await instagramJobService.markScrapeJobRunning(job.data.scrapeJobId);
    try {
      await instagramJobService.fetchPostEngagement(job.data.postId);
      await instagramJobService.markScrapeJobCompleted(job.data.scrapeJobId);
      logger.info("Engagement fetch job completed", { jobId: job.id });
    } catch (error) {
      await instagramJobService.markScrapeJobFailed(job.data.scrapeJobId, error);
      logger.error("Engagement fetch job failed", {
        jobId: job.id,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  },
  { connection: redisConnection }
);

new Worker<BaseJobData & { postId?: string }>(
  "scoring",
  async (job) => {
    logger.info("Scoring job started", { jobId: job.id, data: job.data });
    await instagramJobService.markScrapeJobRunning(job.data.scrapeJobId);
    try {
      if (job.data.postId) {
        await scoringService.recalculatePostStatus(job.data.postId);
      } else {
        await scoringService.recalculateAllScores();
      }
      await instagramJobService.markScrapeJobCompleted(job.data.scrapeJobId);
      logger.info("Scoring job completed", { jobId: job.id });
    } catch (error) {
      await instagramJobService.markScrapeJobFailed(job.data.scrapeJobId, error);
      logger.error("Scoring job failed", {
        jobId: job.id,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  },
  { connection: redisConnection }
);

logger.info("Workers started");
