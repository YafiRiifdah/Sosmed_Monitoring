import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout, type PageKey } from "./layouts/AppLayout";
import { MonitoredAccountsPage, TargetAccountsPage } from "./pages/AccountsPages";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminManagementPage } from "./pages/AdminManagementPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { PostsPage } from "./pages/PostsPage";
import { RankingPage } from "./pages/RankingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { api } from "./services/api";
import type { PostSummary, User } from "./types";

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState<PageKey>("overview");
  const [selectedPost, setSelectedPost] = useState<PostSummary | null>(null);

  // Restore active session on application startup
  useEffect(() => {
    api.me()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Clear state regardless of network outcome
    }
    setUser(null);
    setSelectedPost(null);
    setPage("overview");
  }

  function changePage(nextPage: PageKey) {
    setSelectedPost(null);
    setPage(nextPage);
  }

  // 1. Render sleek loading spinner during session restoration
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  // 2. Enforce login page redirection if not authenticated
  if (!user) {
    return <LoginPage onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <AppLayout page={page} currentUser={user} onPageChange={changePage} onLogout={handleLogout}>
      <AnimatePresence mode="wait">
        {selectedPost ? (
          <motion.div
            key="post-detail"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <PostDetailPage post={selectedPost} onBack={() => setSelectedPost(null)} />
          </motion.div>
        ) : (
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            {page === "overview" && <OverviewPage />}
            {page === "targets" && <TargetAccountsPage />}
            {page === "monitored" && <MonitoredAccountsPage />}
            {page === "posts" && <PostsPage onOpenPost={setSelectedPost} />}
            {page === "ranking" && <RankingPage />}
            {page === "apiUsage" && <ApiKeysPage />}
            {page === "admin" && <AdminManagementPage currentUser={user} />}
            {page === "settings" && <SettingsPage currentUser={user} onUserUpdate={(updatedUser) => setUser(updatedUser)} />}
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
