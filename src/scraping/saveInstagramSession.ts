import { chromium } from "playwright";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

logger.info("Opening Instagram login. Complete login manually, then press Enter in this terminal.");
await page.goto("https://www.instagram.com/accounts/login/", { waitUntil: "domcontentloaded" });

await new Promise<void>((resolve) => {
  process.stdin.resume();
  process.stdin.once("data", () => resolve());
});

await context.storageState({ path: env.INSTAGRAM_STORAGE_STATE });
logger.info(`Saved Instagram session to ${env.INSTAGRAM_STORAGE_STATE}`);
await browser.close();
process.exit(0);
