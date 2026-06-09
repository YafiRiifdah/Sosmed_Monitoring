import type { ReactNode } from "react";
import type { User } from "../types";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

export type PageKey =
  | "overview"
  | "targetsInstagram"
  | "targetsTikTok"
  | "targetsFacebook"
  | "monitoredInstagram"
  | "monitoredTikTok"
  | "monitoredFacebook"
  | "postsInstagram"
  | "postsTikTok"
  | "postsFacebook"
  | "rankingInstagram"
  | "rankingTikTok"
  | "rankingFacebook"
  | "apiUsageInstagram"
  | "apiUsageTikTok"
  | "apiUsageFacebook"
  | "analytics"
  | "admin"
  | "settings";

export function AppLayout({
  page,
  currentUser,
  onPageChange,
  onLogout,
  children
}: {
  page: PageKey;
  currentUser: User;
  onPageChange: (page: PageKey) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell min-h-screen text-[var(--text)]">
      <AppTopbar currentUser={currentUser} onLogout={onLogout} onPageChange={onPageChange} />

      {/* Main Content Area */}
      <div className="pt-20 lg:pl-72">
        <AppSidebar
          currentUser={currentUser}
          onLogout={onLogout}
          onPageChange={onPageChange}
          page={page}
        />

        {/* Main Section */}
        <main className="w-full p-4 pb-24 sm:p-8 lg:p-10 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}
