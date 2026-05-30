import { ScrapeJobStatus, ScrapeJobType } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import { engagementFetchQueue, postDiscoveryQueue, scoringQueue } from "../queues/index.js";

export const jobService = {
  async enqueuePostDiscovery(targetAccountId?: string) {
    const scrapeJob = await prisma.scrapeJob.create({
      data: { jobType: ScrapeJobType.POST_DISCOVERY, status: ScrapeJobStatus.QUEUED }
    });
    await postDiscoveryQueue.add("discover-posts", { scrapeJobId: scrapeJob.id, targetAccountId });
    return scrapeJob;
  },

  async enqueueEngagementFetch(postId?: string) {
    const scrapeJob = await prisma.scrapeJob.create({
      data: { jobType: ScrapeJobType.ENGAGEMENT_FETCH, status: ScrapeJobStatus.QUEUED }
    });
    await engagementFetchQueue.add("fetch-engagements", { scrapeJobId: scrapeJob.id, postId });
    return scrapeJob;
  },

  async enqueueScoring(postId?: string) {
    const scrapeJob = await prisma.scrapeJob.create({
      data: { jobType: ScrapeJobType.SCORING, status: ScrapeJobStatus.QUEUED }
    });
    await scoringQueue.add("recalculate-score", { scrapeJobId: scrapeJob.id, postId });
    return scrapeJob;
  },

  getJob(id: string) {
    return prisma.scrapeJob.findUniqueOrThrow({ where: { id } });
  }
};
