import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
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

export type PostMetadata = {
  caption?: string;
  postedAt?: Date;
};

export type EngagementResult = {
  likes: string[];
  comments: CommentResult[];
  warnings: string[];
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
  private readonly maxModalScrolls = 12;
  private readonly maxCommentScrolls = 8;

  async loadSession() {
    if (!existsSync(env.INSTAGRAM_STORAGE_STATE)) {
      throw new InstagramSessionError(
        `Instagram session not found at ${env.INSTAGRAM_STORAGE_STATE}. Login manually and generate storage_state.json before running scraping jobs.`
      );
    }

    this.browser = await chromium.launch({ channel: "chromium", headless: true });
    this.context = await this.browser.newContext({ storageState: env.INSTAGRAM_STORAGE_STATE });
    const page = await this.context.newPage();
    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 45000 });

    const loginVisible = await page.getByText(/log in|masuk/i).first().isVisible().catch(() => false);
    if (loginVisible || page.url().includes("/accounts/login")) {
      throw new InstagramSessionError("Instagram session expired. Please login manually again and regenerate storage_state.json.");
    }

    await page.close();
  }

  async discoverPosts(username: string, limit = 12): Promise<DiscoveredPost[]> {
    const context = await this.requireContext();
    const page = await context.newPage();
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: "domcontentloaded", timeout: 45000 });

    const privateOrMissing = await page.getByText(/private|isn't available|tidak tersedia|bersifat pribadi/i).first().isVisible().catch(() => false);
    if (privateOrMissing) {
      throw new Error(`Cannot scrape @${username}. Account is private, unavailable, or blocked by Instagram.`);
    }

    await page.waitForTimeout(3000);
    const postLinks = await page.$$eval('a[href*="/p/"], a[href*="/reel/"]', (links) =>
      Array.from(new Set(links.map((link) => (link as HTMLAnchorElement).href)))
    );
    await page.close();

    const posts: DiscoveredPost[] = [];
    for (const rawPostUrl of postLinks.slice(0, limit)) {
      const postUrl = this.normalizePostUrl(rawPostUrl);
      const metadata = await this.fetchPostMetadata(postUrl).catch((): PostMetadata => ({}));
      posts.push({
        instagramPostId: this.extractPostId(postUrl),
        postUrl,
        caption: metadata.caption,
        postedAt: metadata.postedAt
      });
    }

    return posts;
  }

  async fetchPostMetadata(postUrl: string): Promise<PostMetadata> {
    const context = await this.requireContext();
    const page = await context.newPage();
    try {
      await this.openPost(page, postUrl);
      const metadata = await page.evaluate(() => {
        const time = document.querySelector<HTMLTimeElement>("time[datetime]");
        const postedAt = time?.dateTime;

        const directCaption =
          document.querySelector("article h1")?.textContent?.trim() ||
          document.querySelector("h1")?.textContent?.trim() ||
          "";

        const description =
          document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content ||
          document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ||
          "";

        const parsedCaption = (() => {
          const quoteMatch = description.match(/: "([\s\S]*)"$/);
          if (quoteMatch?.[1]) return quoteMatch[1].trim();
          const colonIndex = description.indexOf(": ");
          if (colonIndex >= 0) return description.slice(colonIndex + 2).replace(/^"|"$/g, "").trim();
          return "";
        })();

        const caption = directCaption || parsedCaption || undefined;
        return {
          caption,
          postedAt
        };
      });
      return {
        caption: metadata.caption,
        postedAt: metadata.postedAt ? new Date(metadata.postedAt) : undefined
      };
    } finally {
      await page.close();
    }
  }

  async fetchLikes(postUrl: string): Promise<string[]> {
    const context = await this.requireContext();
    const page = await context.newPage();
    try {
      await this.openPost(page, postUrl);

      const likeButton = page.locator('a[href*="/liked_by/"], a:has-text("likes"), a:has-text("like"), span:has-text("likes"), span:has-text("like"), span:has-text("suka")').first();
      const hasLikeButton = await likeButton.isVisible().catch(() => false);
      if (!hasLikeButton) {
        await this.saveDebugArtifact(page, postUrl, "like-trigger-not-found");
        return [];
      }

      await likeButton.click({ timeout: 10000 }).catch(async () => {
        const fallback = page.getByText(/likes?|suka/i).first();
        await fallback.click({ timeout: 10000 });
      });

      const dialog = page.locator('div[role="dialog"]').last();
      const hasDialog = await dialog.waitFor({ state: "visible", timeout: 15000 }).then(() => true).catch(() => false);
      if (!hasDialog) {
        await this.saveDebugArtifact(page, postUrl, "likes-dialog-not-visible");
        return [];
      }
      await this.scrollDialog(dialog, this.maxModalScrolls);

      const usernames = await dialog.evaluate((root) => {
        const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'));
        return anchors
          .map((anchor) => anchor.getAttribute("href") ?? "")
          .filter((href) => /^\/[^/?#]+\/?$/.test(href))
          .map((href) => href.replaceAll("/", "").trim())
          .filter(Boolean);
      });

      const uniqueUsernames = this.uniqueUsernames(usernames);
      if (uniqueUsernames.length === 0) {
        await this.saveDebugArtifact(page, postUrl, "likes-dialog-empty");
      }
      return uniqueUsernames;
    } finally {
      await page.close();
    }
  }

  async fetchComments(postUrl: string): Promise<CommentResult[]> {
    const context = await this.requireContext();
    const page = await context.newPage();
    try {
      await this.openPost(page, postUrl);
      await this.expandComments(page);

      const comments = await page.evaluate(() => {
        const usernamePattern = /^\/([^/?#]+)\/$/;
        const blockedUsernames = new Set(["p", "reel", "explore", "accounts", "direct"]);

        const listItems = Array.from(document.querySelectorAll("ul li"));
        return listItems.flatMap((item) => {
          const anchors = Array.from(item.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'));
          const usernameAnchor = anchors.find((anchor) => {
            const href = anchor.getAttribute("href") ?? "";
            const match = href.match(usernamePattern);
            return Boolean(match?.[1] && !blockedUsernames.has(match[1]));
          });

          const href = usernameAnchor?.getAttribute("href") ?? "";
          const username = href.match(usernamePattern)?.[1];
          if (!username) return [];

          const text = (item.textContent ?? "").replace(/\s+/g, " ").trim();
          const usernameText = usernameAnchor?.textContent?.trim() ?? username;
          const commentText = text.startsWith(usernameText) ? text.slice(usernameText.length).trim() : text;

          if (!commentText || /^liked by|likes?$/i.test(commentText)) return [];
          return [{ username, commentText }];
        });
      });

      return comments
        .map((comment) => ({
          username: this.normalizeUsername(comment.username),
          commentText: comment.commentText.trim()
        }))
        .filter((comment) => comment.username && comment.commentText)
        .filter((comment, index, all) =>
          all.findIndex((item) => item.username === comment.username && item.commentText === comment.commentText) === index
        );
    } finally {
      await page.close();
    }
  }

  async fetchEngagement(postUrl: string): Promise<EngagementResult> {
    const warnings: string[] = [];
    const likes = await this.fetchLikes(postUrl).catch((error) => {
      warnings.push(`Likes extraction failed: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    });
    const comments = await this.fetchComments(postUrl).catch((error) => {
      warnings.push(`Comments extraction failed: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    });

    if (likes.length === 0) {
      warnings.push("No likes were extracted. Instagram may hide the likes modal, the worker account may not be allowed to see it, or selectors need UI inspection.");
    }

    return { likes, comments, warnings };
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

  private async openPost(page: Page, postUrl: string) {
    await page.goto(this.normalizePostUrl(postUrl), { waitUntil: "domcontentloaded", timeout: 45000 });
    const loginVisible = await page.getByText(/log in|masuk/i).first().isVisible().catch(() => false);
    if (loginVisible || page.url().includes("/accounts/login")) {
      throw new InstagramSessionError("Instagram session expired while opening post. Please login manually again.");
    }
    const unavailable = await page.getByText(/private|isn't available|tidak tersedia|bersifat pribadi/i).first().isVisible().catch(() => false);
    if (unavailable) {
      throw new Error(`Cannot scrape post ${postUrl}. Post is private, unavailable, or blocked by Instagram.`);
    }
    await page.waitForTimeout(3000);
  }

  private async expandComments(page: Page) {
    for (let index = 0; index < this.maxCommentScrolls; index += 1) {
      const moreButton = page.getByText(/view all|view more|load more|lihat semua|lihat komentar lainnya/i).first();
      if (await moreButton.isVisible().catch(() => false)) {
        await moreButton.click({ timeout: 5000 }).catch(() => undefined);
      }
      await page.mouse.wheel(0, 900).catch(() => undefined);
      await page.waitForTimeout(700);
    }
  }

  private async scrollDialog(dialog: ReturnType<Page["locator"]>, maxScrolls: number) {
    for (let index = 0; index < maxScrolls; index += 1) {
      await dialog.evaluate((root) => {
        const scrollable = Array.from(root.querySelectorAll<HTMLElement>("div")).find(
          (element) => element.scrollHeight > element.clientHeight + 10
        );
        (scrollable ?? (root as HTMLElement)).scrollTop = (scrollable ?? (root as HTMLElement)).scrollHeight;
      });
      await dialog.page().waitForTimeout(700);
    }
  }

  private uniqueUsernames(usernames: string[]) {
    return Array.from(new Set(usernames.map((username) => this.normalizeUsername(username)).filter(Boolean)));
  }

  private normalizeUsername(username: string) {
    return username.replace(/^@/, "").trim().toLowerCase();
  }

  private extractPostId(postUrl: string) {
    const match = postUrl.match(/\/(?:p|reel)\/([^/?#]+)/);
    if (!match?.[1]) {
      throw new Error(`Unable to extract Instagram post id from ${postUrl}`);
    }
    return match[1];
  }

  private normalizePostUrl(postUrl: string) {
    const postId = this.extractPostId(postUrl);
    const type = postUrl.includes("/reel/") ? "reel" : "p";
    return `https://www.instagram.com/${type}/${postId}/`;
  }

  private async saveDebugArtifact(page: Page, postUrl: string, reason: string) {
    if (!env.SCRAPE_DEBUG_ENABLED) return;
    await mkdir(env.SCRAPE_DEBUG_DIR, { recursive: true });
    const postId = this.extractPostId(postUrl);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const baseName = `${timestamp}-${postId}-${reason}`;
    const screenshotPath = path.join(env.SCRAPE_DEBUG_DIR, `${baseName}.png`);
    const htmlPath = path.join(env.SCRAPE_DEBUG_DIR, `${baseName}.html`);

    await Promise.all([
      page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined),
      writeFile(htmlPath, await page.content(), "utf8").catch(() => undefined)
    ]);
  }
}
