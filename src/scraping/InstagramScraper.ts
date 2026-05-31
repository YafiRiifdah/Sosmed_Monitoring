import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page, type Response } from "playwright";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

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
  likeFetchUnavailable: boolean;
  warnings: string[];
};

type LikesResult = {
  usernames: string[];
  unavailable: boolean;
};

type UsernameCapture = {
  stop: () => void;
  getLikeUsernames: () => string[];
  getAnyUsernames: () => string[];
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

    this.browser = await chromium.launch({
      channel: "chromium",
      headless: true,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    });
    
    this.context = await this.browser.newContext({
      storageState: env.INSTAGRAM_STORAGE_STATE,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      locale: "en-US",
      timezoneId: "Asia/Jakarta"
    });
    
    await this.applyStealthToContext(this.context);

    const page = await this.context.newPage();
    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 45000 });

    const loginVisible = await page.getByText(/log in|masuk/i).first().isVisible().catch(() => false);
    if (loginVisible || page.url().includes("/accounts/login")) {
      throw new InstagramSessionError("Instagram session expired. Please login manually again and regenerate storage_state.json.");
    }

    await page.close();
  }

  private async applyStealthToContext(context: BrowserContext) {
    await context.addInitScript(() => {
      // Override webdriver to undefined to bypass bot detection
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined
      });

      // Mock chrome object
      (window as any).chrome = {
        runtime: {}
      };

      // Mock languages
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"]
      });

      // Mock plugins
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5]
      });
    });
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

  async fetchPostMetadata(postUrl: string, targetUsername?: string): Promise<PostMetadata> {
    const context = await this.requireContext();
    const page = await context.newPage();
    try {
      await this.openPost(page, postUrl, targetUsername);
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

  async fetchLikes(postUrl: string, targetUsername?: string): Promise<LikesResult> {
    // If RapidAPI is configured, try it first for extremely fast and stable likes extraction
    if (env.RAPIDAPI_KEY) {
      try {
        const postId = this.extractPostId(postUrl);
        let url = "";
        if (env.RAPIDAPI_LIKES_URL.includes("instagram-api-fast-reliable-data-scraper")) {
          const mediaId = this.shortcodeToMediaId(postId);
          url = `${env.RAPIDAPI_LIKES_URL}?media_id=${mediaId}`;
        } else if (env.RAPIDAPI_LIKES_URL.includes("instagram-scraper2")) {
          url = `${env.RAPIDAPI_LIKES_URL}?short_code=${postId}`;
        } else {
          url = `${env.RAPIDAPI_LIKES_URL}?code_or_id_or_url=${postId}`;
        }
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-key": env.RAPIDAPI_KEY,
            "x-rapidapi-host": env.RAPIDAPI_HOST
          }
        });
        if (response.ok) {
          const body = await response.json();
          const usernames = this.extractUsernamesFromUnknown(body);
          if (usernames.length > 0) {
            return { usernames: this.uniqueUsernames(usernames), unavailable: false };
          } else {
            logger.warn("RapidAPI likes fetch returned no usernames in response body", { url });
          }
        } else {
          const errText = await response.text().catch(() => "");
          logger.warn("RapidAPI likes fetch failed with HTTP status", {
            status: response.status,
            statusText: response.statusText,
            url,
            body: errText
          });
        }
      } catch (error) {
        logger.error("RapidAPI likes fetch caught exception", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const context = await this.requireContext();
    const page = await context.newPage();
    const capture = this.startInstagramUsernameCapture(page);
    try {
      await this.openPost(page, postUrl, targetUsername);

      const embeddedLikeUsernames = await this.fetchLikesViaEmbeddedJson(page);
      if (embeddedLikeUsernames.length > 0) {
        return { usernames: this.uniqueUsernames(embeddedLikeUsernames), unavailable: false };
      }

      const capturedBeforeModal = capture.getLikeUsernames();
      if (capturedBeforeModal.length > 0) {
        return { usernames: this.uniqueUsernames(capturedBeforeModal), unavailable: false };
      }

      // Fallback: Try opening the likes dialog and scrolling to capture username API responses
      const dialogOpened = await this.openLikesDialog(page).catch(() => false);
      if (dialogOpened) {
        const dialogLocator = page.locator('div[role="dialog"]:not(:has(article))').last();
        await this.scrollDialog(dialogLocator, this.maxModalScrolls).catch(() => undefined);
        
        const capturedFromModal = capture.getLikeUsernames();
        if (capturedFromModal.length > 0) {
          return { usernames: this.uniqueUsernames(capturedFromModal), unavailable: false };
        }
      }

      await page.waitForTimeout(3000);
      const capturedAfterNetworkIdle = capture.getLikeUsernames();
      if (capturedAfterNetworkIdle.length > 0) {
        return { usernames: this.uniqueUsernames(capturedAfterNetworkIdle), unavailable: false };
      }

      await this.saveDebugArtifact(page, postUrl, "likes-unavailable");
      return { usernames: [], unavailable: true };
    } finally {
      capture.stop();
      await page.close();
    }
  }

  /**
   * Opens the likes dialog on the current post page.
   * Uses multiple strategies in order of reliability.
   */
  private async openLikesDialog(page: Page) {
    // Strategy 1: Direct "liked_by" link (most reliable if present)
    const likedByLink = page.locator('a[href*="/liked_by/"]').first();
    if (await likedByLink.isVisible().catch(() => false)) {
      await likedByLink.click({ timeout: 10000 }).catch(() => undefined);
      if (await this.waitForLikesDialog(page)) return true;
    }

    // Strategy 1.5: Native Playwright click on like count role="button" (extremely robust in React synthetic events)
    const nativeLikeButton = page.locator([
      'div[role="button"]:has-text("likes")',
      'div[role="button"]:has-text("suka")',
      'div[role="button"]:has-text("others")',
      'div[role="button"]:has-text("lainnya")',
      'span[role="button"]:has-text("likes")',
      'span[role="button"]:has-text("suka")',
      'span[role="button"]:has-text("others")',
      'span[role="button"]:has-text("lainnya")'
    ].join(", ")).first();

    try {
      await nativeLikeButton.waitFor({ state: "visible", timeout: 5000 });
      await nativeLikeButton.click({ timeout: 10000 });
      if (await this.waitForLikesDialog(page)) return true;
    } catch {
      // Proceed to fallback strategies if the button doesn't appear
    }

    // Strategy 2: span[role="button"] with numeric text (Instagram 2026 UI)
    // Instagram renders the like count as <span role="button" tabindex="0">58</span>
    const clickedRoleButton = await page.evaluate(`(() => {
      const isLikeCountText = (text) => {
        const cleaned = text.trim().toLowerCase();
        return /^[0-9][0-9.,]*[kKmM]?$/.test(cleaned.replace(/\\s+/g, "")) ||
               /^[0-9][0-9.,]*[kKmM]?\\s*(likes?|suka)$/.test(cleaned) ||
               cleaned.includes("others") ||
               cleaned.includes("lainnya");
      };

      const root = document.body;

      const spans = Array.from(root.querySelectorAll('[role="button"]'));
      const numericSpans = spans.filter((span) => {
        const text = (span.textContent || "").trim();
        return text.length > 0 && text.length < 15 && isLikeCountText(text);
      });

      if (numericSpans.length === 0) return false;

      const heartIcon =
        root.querySelector('svg[aria-label="Like"], svg[aria-label="Unlike"]') ||
        root.querySelector('svg[aria-label="Suka"], svg[aria-label="Batal suka"]') ||
        root.querySelector('svg[aria-label="Batal Suka"]');

      if (heartIcon) {
        const heartRect = heartIcon.getBoundingClientRect();
        const withDistance = numericSpans
          .map((span) => {
            const rect = span.getBoundingClientRect();
            return {
              span,
              distance: Math.abs(rect.top - heartRect.bottom) + Math.abs(rect.left - heartRect.left)
            };
          })
          .sort((a, b) => a.distance - b.distance);

        const best = withDistance[0];
        if (best) {
          best.span.click();
          return true;
        }
      }

      numericSpans[0].click();
      return true;
    })()`);

    if (clickedRoleButton && (await this.waitForLikesDialog(page))) return true;

    // Strategy 3: "Liked by" / "Disukai" section with "others" / "lainnya" text
    const likedByOthers = page.locator(
      [
        'a:has-text("others")',
        'a:has-text("lainnya")',
        'span:has-text("others")',
        'span:has-text("lainnya")',
        'button:has-text("others")',
        'button:has-text("lainnya")'
      ].join(", ")
    ).first();
    if (await likedByOthers.isVisible().catch(() => false)) {
      await likedByOthers.click({ timeout: 10000 }).catch(() => undefined);
      if (await this.waitForLikesDialog(page)) return true;
    }

    // Strategy 4: Text-based "likes" / "like" / "suka" trigger
    const textLikeTrigger = page
      .locator(
        [
          'a:has-text("likes")',
          'a:has-text("like")',
          'a:has-text("suka")',
          'span:has-text("likes")',
          'span:has-text("like")',
          'span:has-text("suka")',
          'button:has-text("likes")',
          'button:has-text("like")',
          'button:has-text("suka")'
        ].join(", ")
      )
      .first();

    if (await textLikeTrigger.isVisible().catch(() => false)) {
      await textLikeTrigger.click({ timeout: 10000 }).catch(async () => {
        const fallback = page.getByText(/likes?|suka/i).first();
        await fallback.click({ timeout: 10000 });
      });
      if (await this.waitForLikesDialog(page)) return true;
    }

    // Strategy 5: Broader numeric like count search near heart icon (relaxed proximity)
    const clickedNumericLikeCount = await page.evaluate(`(() => {
      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };

      const isLikeCountText = (text) => {
        const cleaned = text.trim().toLowerCase();
        return /^[0-9][0-9.,]*[kKmM]?$/.test(cleaned.replace(/\\s+/g, "")) ||
               /^[0-9][0-9.,]*[kKmM]?\\s*(likes?|suka)$/.test(cleaned) ||
               cleaned.includes("others") ||
               cleaned.includes("lainnya");
      };

      const root = document.body;

      const heartIcon =
        root.querySelector('svg[aria-label="Like"], svg[aria-label="Unlike"]') ||
        root.querySelector('svg[aria-label="Suka"], svg[aria-label="Batal suka"]') ||
        root.querySelector('svg[aria-label="Batal Suka"]');
      if (!heartIcon) return false;

      const heartRect = heartIcon.getBoundingClientRect();
      const candidates = Array.from(root.querySelectorAll("a, button, span, div, section *"))
        .filter((element) => isVisible(element))
        .filter((element) => {
          const text = (element.textContent || "").trim();
          return text.length > 0 && text.length < 15 && isLikeCountText(text);
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            element,
            rect,
            distance: Math.abs(rect.top - heartRect.bottom) + Math.abs(rect.left - heartRect.left)
          };
        })
        .filter(({ rect }) => rect.top >= heartRect.top - 50 && rect.top <= heartRect.bottom + 200)
        .sort((a, b) => a.distance - b.distance);

      const target = candidates[0]?.element;
      if (!target) return false;

      if (target.getAttribute("role") === "button") {
        target.click();
      } else {
        const clickable = target.closest("a, button, [role='button']") || target;
        clickable.click();
      }
      return true;
    })()`);

    if (!clickedNumericLikeCount) return false;
    return this.waitForLikesDialog(page);
  }

  private async waitForLikesDialog(page: Page) {
    return page
      .locator('div[role="dialog"]:not(:has(article))')
      .last()
      .waitFor({ state: "visible", timeout: 10000 })
      .then(() => true)
      .catch(() => false);
  }

  async fetchComments(postUrl: string, targetUsername?: string): Promise<CommentResult[]> {
    const context = await this.requireContext();
    const page = await context.newPage();
    try {
      await this.openPost(page, postUrl, targetUsername);
      await this.expandComments(page);

      const comments = (await page.evaluate(`(() => {
        const usernamePattern = /^\\/([^/?#]+)\\/?$/;
        const blockedUsernames = new Set([
          "p",
          "reel",
          "explore",
          "accounts",
          "direct",
          "about",
          "blog",
          "legal",
          "web",
          "popular"
        ]);

        const normalizeText = (value) => (value || "").replace(/\\s+/g, " ").trim();
        const cleanCommentText = (value, usernameText) => {
          let text = normalizeText(value);
          if (usernameText && text.startsWith(usernameText)) text = text.slice(usernameText.length).trim();
          return text
            .replace(/^Edited\\s*[-•]\\s*\\d+[smhdw]?\\s*/i, "")
            .replace(/^\\d+[smhdw]?\\s*/i, "")
            .replace(/\\s*Reply\\s*$/i, "")
            .replace(/\\s*See translation\\s*$/i, "")
            .replace(/\\s*Lihat terjemahan\\s*$/i, "")
            .trim();
        };
        const parseUsername = (anchor) => {
          const href = anchor.getAttribute("href") || "";
          const match = href.match(usernamePattern);
          const username = match && match[1] ? match[1].trim() : "";
          if (!username || blockedUsernames.has(username)) return "";
          return username;
        };

        const findCommentContainer = (anchor) => {
          let node = anchor;
          for (let depth = 0; node && depth < 8; depth += 1) {
            const text = normalizeText(node.textContent);
            if (text && text.length <= 700 && text.includes(normalizeText(anchor.textContent))) {
              const lower = text.toLowerCase();
              if (!lower.includes("instagram from meta") && !lower.includes("switch display language")) {
                return node;
              }
            }
            node = node.parentElement;
          }
          return anchor.parentElement || anchor;
        };

        const results = [];
        const pushComment = (username, commentText) => {
          const normalizedUsername = normalizeText(username);
          const normalizedText = normalizeText(commentText);
          if (!normalizedUsername || !normalizedText) return;
          if (/^liked by|likes?|follow|message$/i.test(normalizedText)) return;
          results.push({ username: normalizedUsername, commentText: normalizedText });
        };

        const listItems = Array.from(document.querySelectorAll("ul li"));
        for (const item of listItems) {
          const usernameAnchor = Array.from(item.querySelectorAll('a[href^="/"]')).find((anchor) => parseUsername(anchor));
          const username = usernameAnchor ? parseUsername(usernameAnchor) : "";
          if (!username) continue;

          const usernameText = normalizeText(usernameAnchor.textContent) || username;
          const textSpans = Array.from(item.querySelectorAll('span[dir="auto"]'));
          const candidateTexts = textSpans
            .map((span) => {
              const clone = span.cloneNode(true);
              clone.querySelectorAll("a").forEach((link) => link.remove());
              return cleanCommentText(clone.textContent, usernameText);
            })
            .filter((text) => text && text !== usernameText);

          if (candidateTexts.length > 0) {
            pushComment(username, candidateTexts.join(" "));
            continue;
          }

          pushComment(username, cleanCommentText(item.textContent, usernameText));
        }

        const anchors = Array.from(document.querySelectorAll('a[href^="/"]'));
        const fallbackResults = anchors.flatMap((anchor) => {
          const username = parseUsername(anchor);
          if (!username) return [];

          const usernameText = normalizeText(anchor.textContent) || username;
          const container = findCommentContainer(anchor);
          let text = normalizeText(container.textContent);

          if (!text || text === usernameText) return [];
          if (text.startsWith(usernameText)) text = text.slice(usernameText.length).trim();
          text = text
            .replace(/^Edited\\s*•\\s*\\d+[smhdw]?\\s*/i, "")
            .replace(/^\\d+[smhdw]?\\s*/i, "")
            .replace(/\\s*Reply\\s*$/i, "")
            .replace(/\\s*See translation\\s*$/i, "")
            .trim();

          if (!text || /^liked by|likes?|follow|message$/i.test(text)) return [];
          return [{ username, commentText: text }];
        });

        return results.concat(fallbackResults);
      })()`)) as CommentResult[];

      const uniqueComments = comments
        .map((comment) => ({
          username: this.normalizeUsername(comment.username),
          commentText: comment.commentText.trim()
        }))
        .filter((comment) => comment.username && comment.commentText)
        .filter((comment, index, all) =>
          all.findIndex((item) => item.username === comment.username && item.commentText === comment.commentText) === index
        );

      if (uniqueComments.length === 0) {
        await this.saveDebugArtifact(page, postUrl, "comments-empty");
      }

      return uniqueComments;
    } finally {
      await page.close();
    }
  }

  async fetchEngagement(postUrl: string, targetUsername?: string): Promise<EngagementResult> {
    const warnings: string[] = [];
    const likesResult = await this.fetchLikes(postUrl, targetUsername).catch((error): LikesResult => {
      warnings.push(`Likes extraction failed: ${error instanceof Error ? error.message : String(error)}`);
      return { usernames: [], unavailable: true };
    });
    const comments = await this.fetchComments(postUrl, targetUsername).catch((error) => {
      warnings.push(`Comments extraction failed: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    });

    if (likesResult.unavailable) {
      warnings.push("Like list is unavailable from the current Instagram UI/session. Like scoring is skipped for this fetch.");
    } else if (likesResult.usernames.length === 0) {
      warnings.push("No likes were extracted. Instagram may hide the likes modal, the worker account may not be allowed to see it, or selectors need UI inspection.");
    }

    return { likes: likesResult.usernames, comments, likeFetchUnavailable: likesResult.unavailable, warnings };
  }

  private startInstagramUsernameCapture(page: Page): UsernameCapture {
    const likeUsernames = new Set<string>();
    const anyUsernames = new Set<string>();

    const handler = async (response: Response) => {
      const url = response.url();
      if (!this.isInstagramDataResponse(url)) return;

      try {
        const contentType = response.headers()["content-type"] ?? "";
        if (!contentType.includes("json")) return;

        const body = await response.json().catch(() => undefined);
        if (!body) return;

        for (const username of this.extractUsernamesFromUnknown(body)) {
          anyUsernames.add(username);
        }
        for (const username of this.extractLikeUsernamesFromUnknown(body)) {
          likeUsernames.add(username);
        }
      } catch {
        // Response bodies can be unavailable if the browser has already consumed them.
      }
    };

    page.on("response", handler);

    return {
      stop: () => page.off("response", handler),
      getLikeUsernames: () => Array.from(likeUsernames),
      getAnyUsernames: () => Array.from(anyUsernames)
    };
  }

  private async fetchLikesViaEmbeddedJson(page: Page) {
    const usernames = (await page.evaluate(`(() => {
      const normalizeUsername = (value) => String(value || "").replace(/^@/, "").trim().toLowerCase();
      const results = [];

      const collectFromValue = (value, keyPath = "") => {
        if (!value || typeof value !== "object") return;
        if (Array.isArray(value)) {
          value.forEach((item, index) => collectFromValue(item, keyPath + "." + index));
          return;
        }

        const record = value;
        const keyPathLower = keyPath.toLowerCase();
        const looksLikeLikesContext =
          keyPathLower.includes("liked_by") ||
          keyPathLower.includes("edge_media_preview_like") ||
          keyPathLower.includes("like_and_view_counts") ||
          keyPathLower.includes("likers");

        if (looksLikeLikesContext && typeof record.username === "string") {
          results.push(record.username);
        }
        if (looksLikeLikesContext && record.node && typeof record.node.username === "string") {
          results.push(record.node.username);
        }
        if (looksLikeLikesContext && record.user && typeof record.user.username === "string") {
          results.push(record.user.username);
        }

        Object.entries(record).forEach(([key, child]) => collectFromValue(child, keyPath + "." + key));
      };

      const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));
      for (const script of scripts) {
        try {
          collectFromValue(JSON.parse(script.textContent || "{}"), "script");
        } catch {}
      }

      for (const key of ["_sharedData", "__additionalDataLoaded", "__initialDataLoaded", "__appData"]) {
        try {
          if (window[key]) collectFromValue(window[key], key);
        } catch {}
      }

      return Array.from(new Set(results.map(normalizeUsername).filter(Boolean)));
    })()`)) as string[];

    return this.uniqueUsernames(usernames);
  }

  private isInstagramDataResponse(url: string) {
    return (
      url.includes("instagram.com/api/graphql") ||
      url.includes("instagram.com/graphql/query") ||
      url.includes("/liked_by/") ||
      url.includes("query_hash=") ||
      url.includes("api/v1/media/")
    );
  }

  private extractLikeUsernamesFromUnknown(value: unknown) {
    const usernames = new Set<string>();

    const visit = (node: unknown, keyPath: string) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach((item, index) => visit(item, `${keyPath}.${index}`));
        return;
      }

      const record = node as Record<string, unknown>;
      const lowerKeyPath = keyPath.toLowerCase();
      const isLikesContext =
        lowerKeyPath.includes("liked_by") ||
        lowerKeyPath.includes("edge_media_preview_like") ||
        lowerKeyPath.includes("likers") ||
        lowerKeyPath.includes("like_and_view_counts");

      if (isLikesContext) {
        this.addUsernameFromRecord(record, usernames);
      }

      for (const [key, child] of Object.entries(record)) {
        visit(child, `${keyPath}.${key}`);
      }
    };

    visit(value, "root");
    return Array.from(usernames);
  }

  private extractUsernamesFromUnknown(value: unknown) {
    const usernames = new Set<string>();

    const visit = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }

      const record = node as Record<string, unknown>;
      this.addUsernameFromRecord(record, usernames);
      Object.values(record).forEach(visit);
    };

    visit(value);
    return Array.from(usernames);
  }

  private addUsernameFromRecord(record: Record<string, unknown>, usernames: Set<string>) {
    const directUsername = record.username;
    if (typeof directUsername === "string") {
      const username = this.normalizeUsername(directUsername);
      if (username) usernames.add(username);
    }

    for (const key of ["node", "user", "owner"]) {
      const child = record[key];
      if (!child || typeof child !== "object" || Array.isArray(child)) continue;
      const username = (child as Record<string, unknown>).username;
      if (typeof username === "string") {
        const normalized = this.normalizeUsername(username);
        if (normalized) usernames.add(normalized);
      }
    }
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

  /**
   * Navigate to a post page and wait until post content is fully rendered.
   * Instagram is a SPA that may show the logged-in user's profile first
   * and then navigate client-side to the post URL.
   */
  private async openPost(page: Page, postUrl: string, targetUsername?: string) {
    const normalizedUrl = this.normalizePostUrl(postUrl);
    const postId = this.extractPostId(normalizedUrl);
    let successfullyOpened = false;

    // Strategy A: If we have a targetUsername, navigate via profile page grid click (SPA navigation) to bypass 429 rate limit
    if (targetUsername) {
      try {
        const profileUrl = `https://www.instagram.com/${targetUsername}/`;
        await page.goto(profileUrl, { waitUntil: "networkidle", timeout: 45000 });
        
        // Wait for post link in the profile grid to be visible
        const postLink = page.locator(`a[href*="${postId}"]`).first();
        await postLink.waitFor({ state: "visible", timeout: 10000 }).catch(() => undefined);
        const linkVisible = await postLink.isVisible().catch(() => false);
        
        if (linkVisible) {
          await postLink.click();
          // Wait for URL to change to the post
          await page.waitForURL(/\/p\/|\/reel\//, { timeout: 15000 });
          successfullyOpened = true;
        }
      } catch (error) {
        // Fallback to direct navigation if SPA navigation failed
      }
    }

    // Strategy B: Fallback to direct navigation if Strategy A was skipped or failed
    if (!successfullyOpened) {
      await page.goto(normalizedUrl, { waitUntil: "networkidle", timeout: 60000 });
      await page
        .waitForURL(/\/p\/|\/reel\//, { timeout: 10000 })
        .catch(() => undefined);
    }

    // Check for login redirect
    const loginVisible = await page.getByText(/log in|masuk/i).first().isVisible().catch(() => false);
    if (loginVisible || page.url().includes("/accounts/login")) {
      throw new InstagramSessionError("Instagram session expired while opening post. Please login manually again.");
    }

    // Check for unavailable post
    const unavailable = await page
      .getByText(/private|isn't available|tidak tersedia|bersifat pribadi|halaman ini tidak tersedia/i)
      .first()
      .isVisible()
      .catch(() => false);
    if (unavailable) {
      throw new Error(`Cannot scrape post ${postUrl}. Post is private, unavailable, or blocked by Instagram.`);
    }

    // Wait for post actions to appear.
    const actionsLoaded = await page
      .locator(
        [
          'svg[aria-label="Like"]',
          'svg[aria-label="Unlike"]',
          'svg[aria-label="Suka"]',
          'svg[aria-label="Batal suka"]',
          'svg[aria-label="Batal Suka"]'
        ].join(", ")
      )
      .first()
      .waitFor({ state: "visible", timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    if (!actionsLoaded && !successfullyOpened) {
      // Attempt 2: full reload with networkidle and wait again (only if direct navigation failed)
      await page.goto(normalizedUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(5000);
      await page
        .waitForURL(/\/p\/|\/reel\//, { timeout: 10000 })
        .catch(() => undefined);
      await page
        .locator(
          [
            'svg[aria-label="Like"]',
            'svg[aria-label="Unlike"]',
            'svg[aria-label="Suka"]',
            'svg[aria-label="Batal suka"]',
            'svg[aria-label="Batal Suka"]'
          ].join(", ")
        )
        .first()
        .waitFor({ state: "visible", timeout: 15000 })
        .catch(() => undefined);
    }

    const postActionsRendered = await page
      .locator(
        [
          'svg[aria-label="Like"]',
          'svg[aria-label="Unlike"]',
          'svg[aria-label="Suka"]',
          'svg[aria-label="Batal suka"]',
          'svg[aria-label="Batal Suka"]'
        ].join(", ")
      )
      .first()
      .isVisible()
      .catch(() => false);
    const pageMatchesPost = new RegExp(`/(p|reel)/${this.extractPostId(normalizedUrl)}(?:/|$)`).test(page.url());
    if (!postActionsRendered || !pageMatchesPost) {
      await this.saveDebugArtifact(page, normalizedUrl, "post-not-rendered");
      throw new Error(`Instagram did not render the expected post page. Expected ${normalizedUrl}, current URL is ${page.url()}.`);
    }

    // Wait for the like/heart SVG icon to appear (indicates interactive elements loaded)
    await page
      .locator(
        [
          'svg[aria-label="Like"]',
          'svg[aria-label="Unlike"]',
          'svg[aria-label="Suka"]',
          'svg[aria-label="Batal suka"]',
          'svg[aria-label="Batal Suka"]'
        ].join(", ")
      )
      .first()
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => undefined);

    // Stabilization delay for any remaining JS rendering
    await page.waitForTimeout(2000);
  }

  private async expandComments(page: Page) {
    for (let index = 0; index < this.maxCommentScrolls; index += 1) {
      // Support both English and Indonesian button labels
      const moreButton = page
        .getByText(/view all|view more|load more|lihat semua|lihat komentar lainnya|muat lebih banyak/i)
        .first();
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

  private shortcodeToMediaId(shortcode: string): string {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let id = 0n;
    for (const char of shortcode) {
      const index = alphabet.indexOf(char);
      if (index === -1) continue;
      id = (id * 64n) + BigInt(index);
    }
    return id.toString();
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
