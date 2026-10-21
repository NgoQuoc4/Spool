import prisma from "./prisma.service";

class GhostCleanerService {
  private timer: NodeJS.Timeout | null = null;
  private isCleaning: boolean = false;

  private readonly DEFAULT_FALLBACK_MS = 5 * 60 * 1000; // 5 phút
  private readonly MAX_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 giờ
  /**
   * Quét và xoá các bài viết ghost đã quá hạn (expires_at <= now)
   */
  async cleanupExpiredGhostPosts(): Promise<number> {
    if (this.isCleaning) return 0;
    this.isCleaning = true;

    try {
      const now = new Date();

      // 1. Tìm các bài viết ghost đã hết hạn
      const expiredTweets = await prisma.tweet.findMany({
        where: {
          is_ghost: true,
          expires_at: {
            lte: now,
          },
        },
        select: {
          id: true,
        },
      });

      if (expiredTweets.length === 0) {
        return 0;
      }

      const expiredIds = expiredTweets.map((t) => t.id);

      // 2. Xoá replies con của các bài viết này trước để tránh lỗi foreign key self-relation
      await prisma.tweet.deleteMany({
        where: {
          parent_id: { in: expiredIds },
        },
      });

      // 3. Xoá các bài viết ghost hết hạn
      // (likes, bookmarks, medias, hashtags, mentions, notifications sẽ cascade tự động theo Prisma schema)
      const deleted = await prisma.tweet.deleteMany({
        where: {
          id: { in: expiredIds },
        },
      });

      console.log(
        `👻 [GhostCleaner] Đã tự động xoá ${deleted.count} bài viết ghost hết hạn lúc ${now.toLocaleTimeString()}`,
      );

      return deleted.count;
    } catch (error) {
      console.error("❌ [GhostCleaner] Lỗi khi dọn dẹp ghost posts:", error);
      return 0;
    } finally {
      this.isCleaning = false;
    }
  }

  async getNextExpiringPost() {
    const now = new Date();
    const expiredTweets = await prisma.tweet.findFirst({
      where: {
        is_ghost: true,
        expires_at: {
          gt: now,
        },
      },
      select: {
        id: true,
        expires_at: true,
      },
      orderBy: { expires_at: "asc" },
    });
    return {
      expiredTweets,
    };
  }

  /**
   * Lên lịch chạy tiếp theo dựa trên bài viết gần nhất trong database
   */
  async scheduleNextRun() {
    this.stopScheduler();
    await this.cleanupExpiredGhostPosts();

    // 2. Tìm bài viết sắp hết hạn gần nhất
    const { expiredTweets } = await this.getNextExpiringPost();

    let delayMs = this.DEFAULT_FALLBACK_MS;

    if (expiredTweets) {
      const targetTime = new Date(expiredTweets.expires_at || 0).getTime();
      const calculatedDelay = targetTime - Date.now();
      if (calculatedDelay > 0) {
        delayMs = Math.min(calculatedDelay, this.MAX_TIMEOUT_MS);
        console.log(
          "🚀 ~ GhostCleanerService ~ scheduleNextRun ~ delayMs:",
          delayMs,
        );
      } else {
        delayMs = 1000; // Đã đến giờ, chạy sau 1 giây
      }
      console.log(
        `👻 [GhostCleaner] Bài viết tiếp theo (${expiredTweets.id}) sẽ hết hạn lúc ${new Date(expiredTweets.expires_at || 0).toLocaleTimeString()}. Hẹn giờ sau ${(delayMs / 1000).toFixed(1)} giây.`,
      );
    } else {
      console.log(
        `👻 [GhostCleaner] Hiện không có bài viết sắp hết hạn. Sẽ kiểm tra lại sau ${this.DEFAULT_FALLBACK_MS / 60000} phút.`,
      );
    }

    // 3. Dùng setTimeout để chạy chính xác mốc này, sau đó lặp lại quy trình
    this.timer = setTimeout(async () => {
      await this.scheduleNextRun();
    }, delayMs);
  }

  async initScheduler() {
    console.log("👻 [GhostCleaner] Khởi tạo bộ dọn dẹp động...");
    await this.scheduleNextRun();
  }

  stopScheduler() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

const ghostCleanerService = new GhostCleanerService();
export default ghostCleanerService;
