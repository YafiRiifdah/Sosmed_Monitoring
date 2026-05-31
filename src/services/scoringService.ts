import { EngagementType, PostStatus } from "@prisma/client";
import { prisma } from "../database/prisma.js";

function toStatus(hasLiked: boolean, hasCommented: boolean, likeUnavailable: boolean) {
  if (hasLiked && hasCommented) return PostStatus.COMPLETE;
  if (hasLiked) return PostStatus.LIKE_ONLY;
  if (hasCommented) return PostStatus.COMMENT_ONLY;
  if (likeUnavailable) return PostStatus.LIKE_UNAVAILABLE;
  return PostStatus.MISSING;
}

export const scoringService = {
  async recalculatePostStatus(postId: string) {
    const [post, accounts, engagements] = await Promise.all([
      prisma.instagramPost.findUniqueOrThrow({ where: { id: postId } }),
      prisma.monitoredAccount.findMany({ where: { isActive: true } }),
      prisma.engagement.findMany({ where: { postId } })
    ]);

    const normalized = engagements.map((engagement) => ({
      username: engagement.username.toLowerCase(),
      type: engagement.engagementType
    }));

    await Promise.all(
      accounts.map((account) => {
        const username = account.username.toLowerCase();
        const hasLiked = normalized.some((item) => item.username === username && item.type === EngagementType.LIKE);
        const hasCommented = normalized.some((item) => item.username === username && item.type === EngagementType.COMMENT);
        const likeScore = hasLiked ? 1 : 0;
        const commentScore = hasCommented ? 3 : 0;

        const likeUnavailable = post.likeFetchStatus === "UNAVAILABLE";

        return prisma.accountPostStatus.upsert({
          where: {
            postId_monitoredAccountId: {
              postId: post.id,
              monitoredAccountId: account.id
            }
          },
          update: {
            hasLiked,
            hasCommented,
            likeScore,
            commentScore,
            totalScore: likeScore + commentScore,
            status: toStatus(hasLiked, hasCommented, likeUnavailable)
          },
          create: {
            postId: post.id,
            monitoredAccountId: account.id,
            hasLiked,
            hasCommented,
            likeScore,
            commentScore,
            totalScore: likeScore + commentScore,
            status: toStatus(hasLiked, hasCommented, likeUnavailable)
          }
        });
      })
    );
  },

  async recalculateAllScores() {
    const posts = await prisma.instagramPost.findMany({ select: { id: true } });
    for (const post of posts) {
      await this.recalculatePostStatus(post.id);
    }
  }
};
