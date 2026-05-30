import { EngagementType, ScrapeJobStatus } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../database/prisma.js";
import { InstagramScraper, type PostMetadata } from "../scraping/InstagramScraper.js";
import { logger } from "../utils/logger.js";
import { scoringService } from "./scoringService.js";

export const instagramJobService = {
  async discoverInstagramPosts(targetAccountId?: string) {
    const targets = await prisma.targetAccount.findMany({
      where: { isActive: true, ...(targetAccountId ? { id: targetAccountId } : {}) }
    });
    logger.info("Discovering Instagram posts", { targetCount: targets.length, targetAccountId });

    const scraper = new InstagramScraper();
    try {
      await scraper.loadSession();
      for (const target of targets) {
        const posts = await scraper.discoverPosts(target.username, env.INSTAGRAM_DISCOVERY_POST_LIMIT);
        logger.info("Discovered Instagram posts for target", {
          username: target.username,
          postCount: posts.length,
          limit: env.INSTAGRAM_DISCOVERY_POST_LIMIT
        });
        for (const post of posts) {
          await prisma.instagramPost.upsert({
            where: { instagramPostId: post.instagramPostId },
            update: {
              postUrl: post.postUrl,
              caption: post.caption,
              postedAt: post.postedAt
            },
            create: {
              targetAccountId: target.id,
              instagramPostId: post.instagramPostId,
              postUrl: post.postUrl,
              caption: post.caption,
              postedAt: post.postedAt
            }
          });
        }
      }
    } finally {
      await scraper.close();
    }
  },

  async fetchPostEngagement(postId?: string) {
    const posts = await prisma.instagramPost.findMany({
      where: postId ? { id: postId } : { engagementFetchedAt: null },
      orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }],
      take: postId ? undefined : env.AUTO_FETCH_POST_LIMIT
    });
    logger.info("Selected posts for engagement fetch", {
      mode: postId ? "manual" : "auto",
      postCount: posts.length,
      autoFetchLimit: env.AUTO_FETCH_POST_LIMIT
    });

    const scraper = new InstagramScraper();
    try {
      await scraper.loadSession();
      for (const [index, post] of posts.entries()) {
        logger.info("Fetching Instagram engagement for post", { postId: post.id, postUrl: post.postUrl });
        const metadata: PostMetadata = await scraper.fetchPostMetadata(post.postUrl).catch((error): PostMetadata => {
          logger.warn("Failed to fetch Instagram post metadata", {
            postId: post.id,
            error: error instanceof Error ? error.message : error
          });
          return {};
        });
        if (metadata.caption || metadata.postedAt) {
          await prisma.instagramPost.update({
            where: { id: post.id },
            data: {
              caption: metadata.caption,
              postedAt: metadata.postedAt
            }
          });
        }

        const [likes, comments] = await Promise.all([
          scraper.fetchLikes(post.postUrl),
          scraper.fetchComments(post.postUrl)
        ]);
        logger.info("Fetched Instagram engagement for post", {
          postId: post.id,
          likes: likes.length,
          comments: comments.length
        });

        for (const username of likes) {
          const normalizedUsername = username.toLowerCase();
          await prisma.engagement.upsert({
            where: {
              postId_username_engagementType_commentText: {
                postId: post.id,
                username: normalizedUsername,
                engagementType: EngagementType.LIKE,
                commentText: ""
              }
            },
            update: { detectedAt: new Date() },
            create: {
              postId: post.id,
              username: normalizedUsername,
              engagementType: EngagementType.LIKE,
              commentText: ""
            }
          });
        }

        for (const comment of comments) {
          const normalizedUsername = comment.username.toLowerCase();
          await prisma.engagement.upsert({
            where: {
              postId_username_engagementType_commentText: {
                postId: post.id,
                username: normalizedUsername,
                engagementType: EngagementType.COMMENT,
                commentText: comment.commentText
              }
            },
            update: { detectedAt: new Date() },
            create: {
              postId: post.id,
              username: normalizedUsername,
              engagementType: EngagementType.COMMENT,
              commentText: comment.commentText
            }
          });
        }

        await prisma.instagramPost.update({
          where: { id: post.id },
          data: { engagementFetchedAt: new Date() }
        });
        await scoringService.recalculatePostStatus(post.id);
        if (index < posts.length - 1 && env.SCRAPE_DELAY_MS > 0) {
          await new Promise((resolve) => setTimeout(resolve, env.SCRAPE_DELAY_MS));
        }
      }
    } finally {
      await scraper.close();
    }
  },

  async markScrapeJobRunning(scrapeJobId?: string) {
    if (!scrapeJobId) return;
    await prisma.scrapeJob.update({ where: { id: scrapeJobId }, data: { status: ScrapeJobStatus.RUNNING } });
  },

  async markScrapeJobCompleted(scrapeJobId?: string) {
    if (!scrapeJobId) return;
    await prisma.scrapeJob.update({ where: { id: scrapeJobId }, data: { status: ScrapeJobStatus.COMPLETED } });
  },

  async markScrapeJobFailed(scrapeJobId: string | undefined, error: unknown) {
    if (!scrapeJobId) return;
    await prisma.scrapeJob.update({
      where: { id: scrapeJobId },
      data: {
        status: ScrapeJobStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Unknown worker error"
      }
    });
  }
};
