import { prisma } from "../database/prisma.js";

type TrackPostInput = {
  targetAccountId: string;
  postUrl: string;
};

function extractInstagramPostId(postUrl: string) {
  const parsed = new URL(postUrl);
  const match = parsed.pathname.match(/\/(?:p|reel)\/([^/?#]+)/);
  if (!match?.[1]) {
    throw new Error("Invalid Instagram post URL. Use a /p/{shortcode}/ or /reel/{shortcode}/ URL.");
  }
  return match[1];
}

function normalizePostUrl(postUrl: string) {
  const parsed = new URL(postUrl);
  const postId = extractInstagramPostId(postUrl);
  const type = parsed.pathname.includes("/reel/") ? "reel" : "p";
  return `https://www.instagram.com/${type}/${postId}/`;
}

export const postService = {
  async trackPost(data: TrackPostInput) {
    await prisma.targetAccount.findUniqueOrThrow({ where: { id: data.targetAccountId } });
    const instagramPostId = extractInstagramPostId(data.postUrl);
    const postUrl = normalizePostUrl(data.postUrl);

    return prisma.instagramPost.upsert({
      where: { instagramPostId },
      update: {
        targetAccountId: data.targetAccountId,
        postUrl
      },
      create: {
        targetAccountId: data.targetAccountId,
        instagramPostId,
        postUrl
      },
      include: { targetAccount: true }
    });
  }
};
