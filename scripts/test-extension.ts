import path from "node:path";
import { chromium } from "playwright";

const extensionPath = path.resolve(import.meta.dir, "../dist");

async function testExtension() {
  console.log("Launching browser with extension from:", extensionPath);

  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const page = context.pages()[0] || (await context.newPage());

  // Navigate to YouTube homepage
  console.log("Navigating to YouTube...");
  await page.goto("https://www.youtube.com");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);

  // Check what elements are present/hidden
  const results = await page.evaluate(() => {
    const checkElements = (selectors: string[]) => {
      return selectors.map((sel) => {
        const elements = document.querySelectorAll(sel);
        const visible = Array.from(elements).filter((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden";
        });
        return {
          selector: sel,
          total: elements.length,
          visible: visible.length,
        };
      });
    };

    return {
      shorts: checkElements([
        "ytd-reel-shelf-renderer",
        "ytd-rich-shelf-renderer[is-shorts]",
        'a[href*="/shorts/"]',
        'ytd-mini-guide-entry-renderer a[title="Shorts"]',
      ]),
      homeFeed: checkElements([
        'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
        'ytd-browse[page-subtype="home"] #contents',
      ]),
      header: checkElements(["#masthead-container", "ytd-masthead"]),
    };
  });

  console.log("\n=== YouTube Homepage Test Results ===\n");
  console.log("Shorts elements:", JSON.stringify(results.shorts, null, 2));
  console.log("Home feed elements:", JSON.stringify(results.homeFeed, null, 2));
  console.log("Header elements:", JSON.stringify(results.header, null, 2));

  // Take screenshot
  await page.screenshot({ path: "test-homepage.png" });
  console.log("\nScreenshot saved to test-homepage.png");

  // Navigate to a video
  console.log("\nNavigating to a video...");
  await page.goto("https://www.youtube.com/results?search_query=lofi");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Click first video
  const firstVideo = page.locator("ytd-video-renderer a#video-title").first();
  if (await firstVideo.isVisible()) {
    await firstVideo.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const videoResults = await page.evaluate(() => {
      const checkElements = (selectors: string[]) => {
        return selectors.map((sel) => {
          const elements = document.querySelectorAll(sel);
          const visible = Array.from(elements).filter((el) => {
            const style = window.getComputedStyle(el);
            return style.display !== "none" && style.visibility !== "hidden";
          });
          return {
            selector: sel,
            total: elements.length,
            visible: visible.length,
          };
        });
      };

      return {
        sidebar: checkElements(["#secondary", "#related"]),
        comments: checkElements(["#comments", "ytd-comments"]),
        shorts: checkElements([
          "ytd-reel-shelf-renderer",
          'a[href*="/shorts/"]',
        ]),
      };
    });

    console.log("\n=== Video Page Test Results ===\n");
    console.log(
      "Sidebar elements:",
      JSON.stringify(videoResults.sidebar, null, 2),
    );
    console.log(
      "Comments elements:",
      JSON.stringify(videoResults.comments, null, 2),
    );
    console.log(
      "Shorts elements:",
      JSON.stringify(videoResults.shorts, null, 2),
    );

    await page.screenshot({ path: "test-video.png" });
    console.log("\nScreenshot saved to test-video.png");
  }

  // Close browser after testing
  console.log("\nTest complete. Closing browser...");
  await context.close();
}

testExtension().catch(console.error);
