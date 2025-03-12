import { test, expect } from "@playwright/test";

test.describe("Screenshot Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Start the dev server if not already running
    await page.goto("http://localhost:3000");
    // Wait for any initial animations or loading states
    await page.waitForTimeout(1000);
  });

  test("capture home page states", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Capture initial state
    await page.goto("http://localhost:3000");
    await page.screenshot({
      path: "docs/home-page-initial.png",
      fullPage: true,
    });

    // Generate a meme and capture that state
    await page.click('button:has-text("Generate New Meme")');
    try {
      // Wait for the loading state to appear first
      await page.waitForSelector('button:has-text("Generating...")', {
        timeout: 5000,
      });
      // Then wait for the image to load, with a longer timeout
      await page.waitForSelector('img[alt="Generated meme"]', {
        timeout: 60000,
      });
      // Wait an extra moment for any animations to complete
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: "docs/home-page-generated.png",
        fullPage: true,
      });
    } catch (e) {
      console.log("Couldn't capture generated meme state, but continuing...");
    }
  });

  test("capture trending page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("http://localhost:3000/trending");
    // Wait for memes to load
    await page.waitForSelector(".grid");
    // Wait for images to load
    await page.waitForTimeout(2000);
    // Take the screenshot
    await page.screenshot({
      path: "docs/trending-page.png",
      fullPage: true,
    });
  });
});
