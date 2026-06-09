import { SocialPostPage } from "../components/Post/SocialPostPage";
import type { PostPlatform } from "../components/Post/SocialPostHeader";
import type { PostSummary } from "../types";

export function PostsPage({
  platform = "instagram",
  onOpenPost,
}: {
  platform?: PostPlatform;
  onOpenPost: (post: PostSummary) => void;
}) {
  return <SocialPostPage initialPlatform={platform} onOpenPost={onOpenPost} />;
}
