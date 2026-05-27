import { existsSync } from "node:fs";
import { chromium, type Browser, type BrowserContext } from "playwright";
import { env } from "../config/env.js";

export type DiscoveredPost = {
  instagramPostId: string;
  postUrl: string;
  caption?: string;
  postedAt?: Date;
};

export type CommentResult = {
  username: string;
  commentText: string;
};

export class InstagramSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InstagramSessionError";
  }
}

export class InstagramScraper {
  private browser?: Browser;
  private context?: BrowserContext;

  async loadSession() {
    if (!existsSync(env.INSTAGRAM_STORAGE_STATE)) {
      throw new InstagramSessionError(
        `Instagram session not found at ${env.INSTAGRAM_STORAGE_STATE}. Login manually and generate storage_state.json before running scraping jobs.`
      );
    }

    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext({ storageState: env.INSTAGRAM_STORAGE_STATE });
    const page = await this.context.newPage();
    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 45000 });

    const loginVisible = await page.getByText(/log in|masuk/i).first().isVisible().catch(() => false);
    if (loginVisible || page.url().includes("/accounts/login")) {
      throw new InstagramSessionError("Instagram session expired. Please login manually again and regenerate storage_state.json.");
    }

    await page.close();
  }

  async discoverPosts(username: string): Promise<DiscoveredPost[]> {
    const context = await this.requireContext();
    const page = await context.newPage();
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: "domcontentloaded", timeout: 45000 });

    const privateOrMissing = await page.getByText(/private|isn't available|tidak tersedia|bersifat pribadi/i).first().isVisible().catch(() => false);
    if (privateOrMissing) {
      throw new Error(`Cannot scrape @${username}. Account is private, unavailable, or blocked by Instagram.`);
    }

    await page.waitForTimeout(3000);
    const postLinks = await page.$$eval('a[href*="/p/"], a[href*="/reel/"]', (links) =>
      Array.from(new Set(links.map((link) => (link as HTMLAnchorElement).href))).slice(0, 12)
    );
    await page.close();

    return postLinks.map((postUrl) => ({
      instagramPostId: this.extractPostId(postUrl),
      postUrl
    }));
  }

  async fetchLikes(_postUrl: string): Promise<string[]> {
    await this.requireContext();
    throw new Error(
      "fetchLikes requires selector hardening against the current Instagram UI. No fake likes are returned; inspect the UI with a valid session and implement the modal extraction safely."
    );
  }

  async fetchComments(_postUrl: string): Promise<CommentResult[]> {
    await this.requireContext();
    throw new Error(
      "fetchComments requires selector hardening against the current Instagram UI. No fake comments are returned; inspect the UI with a valid session and implement the comment extraction safely."
    );
  }

  async close() {
    await this.context?.close().catch(() => undefined);
    await this.browser?.close().catch(() => undefined);
  }

  private async requireContext() {
    if (!this.context) {
      await this.loadSession();
    }
    if (!this.context) {
      throw new InstagramSessionError("Instagram browser context could not be initialized.");
    }
    return this.context;
  }

  private extractPostId(postUrl: string) {
    const match = postUrl.match(/\/(?:p|reel)\/([^/?#]+)/);
    if (!match?.[1]) {
      throw new Error(`Unable to extract Instagram post id from ${postUrl}`);
    }
    return match[1];
  }
}
