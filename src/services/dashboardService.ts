import { EngagementType, PostStatus } from "@prisma/client";
import { prisma } from "../database/prisma.js";

export const dashboardService = {
  async getOverview() {
    const [
      totalTargetAccounts,
      totalPosts,
      totalMonitoredAccounts,
      completed,
      incomplete,
      totalStatuses
    ] = await Promise.all([
      prisma.targetAccount.count({ where: { isActive: true } }),
      prisma.instagramPost.count(),
      prisma.monitoredAccount.count({ where: { isActive: true } }),
      prisma.accountPostStatus.count({ where: { status: PostStatus.COMPLETE } }),
      prisma.accountPostStatus.count({ where: { status: { not: PostStatus.COMPLETE } } }),
      prisma.accountPostStatus.count()
    ]);

    return {
      totalTargetAccounts,
      totalPosts,
      totalMonitoredAccounts,
      totalCompletedEngagement: completed,
      totalIncompleteEngagement: incomplete,
      completionPercentage: totalStatuses === 0 ? 0 : Math.round((completed / totalStatuses) * 100)
    };
  },

  async listPosts() {
    const posts = await prisma.instagramPost.findMany({
      include: {
        targetAccount: true,
        statuses: true
      },
      orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }]
    });

    return posts.map((post) => {
      const complete = post.statuses.filter((status) => status.status === PostStatus.COMPLETE).length;
      const total = post.statuses.length;
      return {
        id: post.id,
        instagramPostId: post.instagramPostId,
        postUrl: post.postUrl,
        caption: post.caption,
        postedAt: post.postedAt,
        targetAccount: post.targetAccount,
        engagementPercentage: total === 0 ? 0 : Math.round((complete / total) * 100)
      };
    });
  },

  async getPostStatus(postId: string) {
    const post = await prisma.instagramPost.findUniqueOrThrow({
      where: { id: postId },
      include: {
        targetAccount: true,
        statuses: {
          include: { monitoredAccount: true },
          orderBy: { monitoredAccount: { username: "asc" } }
        }
      }
    });

    return {
      post,
      statuses: post.statuses.map((status) => ({
        id: status.id,
        username: status.monitoredAccount.username,
        displayName: status.monitoredAccount.displayName,
        liked: status.hasLiked,
        commented: status.hasCommented,
        score: status.totalScore,
        status: status.status,
        updatedAt: status.updatedAt
      }))
    };
  },

  async getRanking() {
    const accounts = await prisma.monitoredAccount.findMany({
      where: { isActive: true },
      include: { statuses: true },
      orderBy: { username: "asc" }
    });

    return accounts
      .map((account) => {
        const total = account.statuses.length;
        const complete = account.statuses.filter((status) => status.status === PostStatus.COMPLETE).length;
        return {
          id: account.id,
          username: account.username,
          displayName: account.displayName,
          totalLikes: account.statuses.filter((status) => status.hasLiked).length,
          totalComments: account.statuses.filter((status) => status.hasCommented).length,
          totalScore: account.statuses.reduce((sum, status) => sum + status.totalScore, 0),
          completionPercentage: total === 0 ? 0 : Math.round((complete / total) * 100)
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore || b.completionPercentage - a.completionPercentage);
  },

  async engagementSummary(postId: string) {
    return prisma.engagement.groupBy({
      by: ["engagementType"],
      where: { postId },
      _count: { engagementType: true }
    });
  }
};
