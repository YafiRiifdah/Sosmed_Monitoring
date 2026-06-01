export type UserRole = "SUPER_ADMIN" | "ADMIN";

export type User = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt?: string;
};

export type Account = {
  id: string;
  username: string;
  displayName?: string | null;
  cabangPac?: string | null;
  isActive: boolean;
  createdAt: string;
};

export type ApiKeyUsage = {
  key: string;
  limit: number;
  remaining: number;
  resetAt?: string;
  updatedAt: string;
};

export type Overview = {
  totalTargetAccounts: number;
  totalPosts: number;
  totalMonitoredAccounts: number;
  totalCompletedEngagement: number;
  totalIncompleteEngagement: number;
  completionPercentage: number;
  apiUsage?: ApiKeyUsage[];
};

export type PostSummary = {
  id: string;
  instagramPostId: string;
  postUrl: string;
  caption?: string | null;
  postedAt?: string | null;
  engagementFetchedAt?: string | null;
  likeFetchStatus?: "UNKNOWN" | "AVAILABLE" | "UNAVAILABLE";
  isManuallyTracked: boolean;
  targetAccount: Account;
  engagementPercentage: number;
};

export type ScrapeJobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export type ScrapeJob = {
  id: string;
  jobType: "POST_DISCOVERY" | "ENGAGEMENT_FETCH" | "SCORING";
  status: ScrapeJobStatus;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostStatus = "COMPLETE" | "LIKE_ONLY" | "COMMENT_ONLY" | "LIKE_UNAVAILABLE" | "MISSING";

export type PostStatusRow = {
  id: string;
  username: string;
  displayName?: string | null;
  liked: boolean;
  commented: boolean;
  likeFetchStatus?: "UNKNOWN" | "AVAILABLE" | "UNAVAILABLE";
  score: number;
  status: PostStatus;
  updatedAt: string;
};

export type PostDetail = {
  post: PostSummary;
  statuses: PostStatusRow[];
};

export type RankingRow = {
  id: string;
  username: string;
  displayName?: string | null;
  totalLikes: number;
  totalComments: number;
  totalScore: number;
  completionPercentage: number;
};
