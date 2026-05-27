import { env } from "../config/env.js";
import { jobService } from "../services/jobService.js";
import { logger } from "../utils/logger.js";

function schedule(name: string, intervalMs: number, handler: () => Promise<unknown>) {
  const run = async () => {
    try {
      logger.info(`Scheduler running ${name}`);
      await handler();
    } catch (error) {
      logger.error(`Scheduler failed ${name}`, { error });
    }
  };

  setInterval(run, intervalMs);
  void run();
}

schedule("discover-posts", env.SCHEDULER_DISCOVER_CRON_MS, () => jobService.enqueuePostDiscovery());
schedule("fetch-engagements", env.SCHEDULER_ENGAGEMENT_CRON_MS, () => jobService.enqueueEngagementFetch());
schedule("recalculate-score", env.SCHEDULER_SCORING_CRON_MS, () => jobService.enqueueScoring());

logger.info("Scheduler started");
