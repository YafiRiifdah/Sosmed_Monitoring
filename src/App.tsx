import { useState } from "react";
import { AppLayout, type PageKey } from "./layouts/AppLayout";
import { MonitoredAccountsPage, TargetAccountsPage } from "./pages/AccountsPages";
import { OverviewPage } from "./pages/OverviewPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { PostsPage } from "./pages/PostsPage";
import { RankingPage } from "./pages/RankingPage";
import type { PostSummary } from "./types";

export function App() {
  const [page, setPage] = useState<PageKey>("overview");
  const [selectedPost, setSelectedPost] = useState<PostSummary | null>(null);

  function changePage(nextPage: PageKey) {
    setSelectedPost(null);
    setPage(nextPage);
  }

  return (
    <AppLayout page={page} onPageChange={changePage}>
      {selectedPost ? (
        <PostDetailPage post={selectedPost} onBack={() => setSelectedPost(null)} />
      ) : (
        <>
          {page === "overview" && <OverviewPage />}
          {page === "targets" && <TargetAccountsPage />}
          {page === "monitored" && <MonitoredAccountsPage />}
          {page === "posts" && <PostsPage onOpenPost={setSelectedPost} />}
          {page === "ranking" && <RankingPage />}
        </>
      )}
    </AppLayout>
  );
}
