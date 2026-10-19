import { test, expect } from "@playwright/test";

/**
 * Spool End-to-End Automated Test Suite (Playwright)
 * Covering: Authentication, Tweet Creation, Optimistic Like, and Search
 */

test.describe("Spool E2E User Journey", () => {
  const testUser = {
    email: `test_user_${Date.now()}@spool.dev`,
    password: "Password123!",
    name: "Spool Tester",
  };

  test("TC-AUTH-01 & 04: Đăng ký, Đăng nhập và xác thực truy cập", async ({ page }) => {
    // 1. Điều hướng tới trang đăng ký
    await page.goto("/register");
    await expect(page).toHaveTitle(/Spool|Register/i);

    // 2. Điền form đăng ký
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // 3. Chuyển hướng sang trang đăng nhập và đăng nhập
    await page.goto("/login");
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // 4. Kỳ vọng vào được trang Home (/home)
    await expect(page).toHaveURL(/\/home/);
  });

  test("TC-TWT-01: Đăng tweet mới và kiểm tra hiển thị trên feed", async ({ page }) => {
    await page.goto("/home");

    const tweetContent = `Automated Spool Post - #${Date.now()}`;

    // Tìm ô nhập tweet (PostBar hoặc CreateThreadModal)
    const textarea = page.locator('textarea[placeholder*="Bắt đầu luồng"], textarea[placeholder*="threads"]');
    await textarea.click();
    await textarea.fill(tweetContent);

    // Bấm nút đăng bài
    await page.click('button:has-text("Đăng"), button:has-text("Post")');

    // Bài viết mới xuất hiện ngay trên đầu feed
    await expect(page.locator(`text=${tweetContent}`)).toBeVisible({ timeout: 5000 });
  });

  test("TC-SOC-01 & 02: Optimistic Like & Unlike tương tác tức thì", async ({ page }) => {
    await page.goto("/home");

    // Chọn card bài viết đầu tiên
    const firstTweet = page.locator("article, div[data-testid='tweet-card']").first();
    const likeButton = firstTweet.locator("button:has(svg.lucide-heart), button[aria-label*='like']").first();

    // Lấy số like ban đầu
    const initialLikeText = await likeButton.textContent();
    const initialCount = parseInt(initialLikeText || "0", 10) || 0;

    // Click Like
    await likeButton.click();

    // Optimistic UI: Số like tăng ngay lập tức +1
    await expect(likeButton).toContainText(`${initialCount + 1}`);

    // Click Unlike: Số like giảm về ban đầu
    await likeButton.click();
    await expect(likeButton).toContainText(`${initialCount}`);
  });

  test("TC-SRC-01: Tìm kiếm bài viết với debounce", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page.locator('input[type="search"], input[placeholder*="Tìm kiếm"]');
    await searchInput.fill("Automated");

    // Đợi 400ms debounce
    await page.waitForTimeout(500);

    // Kết quả tìm kiếm hiển thị danh sách bài viết
    await expect(page.locator("text=Automated").first()).toBeVisible();
  });
});
