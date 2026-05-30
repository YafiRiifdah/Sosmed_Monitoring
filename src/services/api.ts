import type { Account, Overview, PostDetail, PostSummary, RankingRow, ScrapeJob } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  overview: () => request<Overview>("/api/overview"),
  ranking: () => request<RankingRow[]>("/api/ranking"),
  posts: () => request<PostSummary[]>("/api/posts"),
  trackPost: (data: { targetAccountId: string; postUrl: string }) =>
    request<PostSummary>("/api/posts/track", { method: "POST", body: json(data) }),
  postStatus: (id: string) => request<PostDetail>(`/api/posts/${id}/status`),

  monitoredAccounts: () => request<Account[]>("/api/monitored-accounts"),
  createMonitored: (data: Partial<Account>) => request<Account>("/api/monitored-accounts", { method: "POST", body: json(data) }),
  bulkImportMonitored: (accounts: Array<Partial<Account> & { username: string }>) =>
    request<Account[]>("/api/monitored-accounts/bulk", { method: "POST", body: json({ accounts }) }),
  updateMonitored: (id: string, data: Partial<Account>) => request<Account>(`/api/monitored-accounts/${id}`, { method: "PUT", body: json(data) }),
  deleteMonitored: (id: string) => request<void>(`/api/monitored-accounts/${id}`, { method: "DELETE" }),

  targetAccounts: () => request<Account[]>("/api/target-accounts"),
  createTarget: (data: Partial<Account>) => request<Account>("/api/target-accounts", { method: "POST", body: json(data) }),
  updateTarget: (id: string, data: Partial<Account>) => request<Account>(`/api/target-accounts/${id}`, { method: "PUT", body: json(data) }),
  deleteTarget: (id: string) => request<void>(`/api/target-accounts/${id}`, { method: "DELETE" }),

  discoverPosts: () => request<ScrapeJob>("/api/jobs/discover-posts", { method: "POST", body: json({}) }),
  fetchEngagements: (postId?: string) => request<ScrapeJob>("/api/jobs/fetch-engagements", { method: "POST", body: json({ postId }) }),
  recalculateScore: () => request<ScrapeJob>("/api/jobs/recalculate-score", { method: "POST", body: json({}) }),
  job: (id: string) => request<ScrapeJob>(`/api/jobs/${id}`)
};
