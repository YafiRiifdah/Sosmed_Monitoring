import { SocialPostPage } from "../components/Post/SocialPostPage";
import type { PostSummary } from "../types";

export function PostsPage({ onOpenPost }: { onOpenPost: (post: PostSummary) => void }) {
  return <SocialPostPage onOpenPost={onOpenPost} />;
}
