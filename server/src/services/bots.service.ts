import Parser from "rss-parser";
import prisma from "./prisma.service";
import { UserRole, UserVerifyStatus } from "@prisma/client";
import aiService from "./ai.service";
import tweetsService from "./tweets.service";
import { TweetAudienceType, TweetType } from "~/types/tweet.types";
import { MediaType } from "~/constants/enums";

export interface NewsItem {
  title: string;
  link: string;
  summary: string;
  pubDate?: string;
  imageUrl?: string;
}
class BotsService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  /**
   * Lấy danh sách tất cả Bot đang có trong database
   */
  async getBots() {
    const [bots, totalItems] = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          role: "Bot",
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          username: true,
        },
      }),
      prisma.user.count({
        where: {
          role: "Bot",
        },
      }),
    ]);
    return { bots, totalItems };
  }
  // async getBotById(id: string) {
  //   const bot = await prisma.user.findUnique({
  //     where: {
  //       id,
  //     },
  //     select: {
  //       id: true,
  //       email: true,
  //       name: true,
  //       avatar: true,
  //       username: true,
  //     },
  //   });
  //   if (!bot) throw new Error("Bot not found");
  //   return bot;
  // }

  /**
   * Lấy hoặc tự động tạo tài khoản Bot hệ thống nếu chưa tồn tại
   */
  async getOrCreateBotUser() {
    const botEmail = "newsbot@system.local";

    const botUser = await prisma.user.upsert({
      where: { email: botEmail },
      update: {
        role: UserRole.Bot,
      },
      create: {
        email: botEmail,
        username: "newsbot",
        name: "Tin Tức AI Bot",
        password: "bot_password_not_used",
        verify: UserVerifyStatus.Verified,
        role: UserRole.Bot,
        bio: "Bot tự động cập nhật và tóm tắt tin tức công nghệ bằng Gemini AI",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=newsbot",
      },
    });

    return botUser;
  }

  /**
   * Lấy danh sách tin tức từ đường dẫn RSS
   * @param feedUrl Link RSS (mặc định là mục Số hóa / Công nghệ của VnExpress)
   * @param limit Số lượng bài muốn lấy (mặc định lấy 5 bài mới nhất)
   */
  async getLatestNews(
    feedUrl: string = "https://vnexpress.net/rss/so-hoa.rss",
    limit: number = 5,
  ): Promise<NewsItem[]> {
    try {
      const feed = await this.parser.parseURL(feedUrl);

      const items = (feed.items || []).slice(0, limit).map((item) => {
        // Tách link ảnh thumbnail từ thẻ <img src="..."> nằm trong content/description của VnExpress/Tuổi Trẻ
        const rawContent = item.content || item.summary || "";
        const imgMatch = rawContent.match(/<img[^>]+src="([^">]+)"/i);
        const imageUrl = imgMatch ? imgMatch[1] : undefined;

        // Làm sạch mô tả: loại bỏ các thẻ HTML nếu có
        const cleanSummary = (item.contentSnippet || "")
          .replace(/<\/?[^>]+(>|$)/g, "")
          .trim();

        return {
          title: item.title || "",
          link: item.link || "",
          summary: cleanSummary,
          pubDate: item.pubDate,
          imageUrl,
        };
      });
      return items;
    } catch (error) {
      console.error("Lỗi khi đọc tin tức từ RSS:", error);
      throw error;
    }
  }

  /**
   * Lấy tin tức mới nhất CHƯA TỪNG ĐƯỢC ĐĂNG, gửi sang Gemini AI để viết bài và đăng lên DB
   * @param userId ID người dùng hoặc tài khoản Bot đăng bài (nếu không truyền sẽ dùng Bot user)
   * @param feedUrl Link RSS cần lấy tin
   */
  async autoPostLatestNews(
    userId?: string,
    feedUrl: string = "https://vnexpress.net/rss/so-hoa.rss",
  ) {
    // 1. Nếu không truyền userId, tự động lấy hoặc tạo tài khoản Bot
    const finalUserId = userId || (await this.getOrCreateBotUser()).id;

    // 2. Lấy danh sách 15 tin mới nhất từ RSS để kiểm tra trùng lặp
    const newsList = await this.getLatestNews(feedUrl, 15);
    if (!newsList || newsList.length === 0) {
      throw new Error("Không tìm thấy tin tức nào từ RSS");
    }

    // 3. Tìm bài viết mới nhất mà trong DB chưa từng đăng (dựa theo link bài báo)
    let targetNews: NewsItem | null = null;
    for (const item of newsList) {
      const existing = await prisma.tweet.findFirst({
        where: {
          content: {
            contains: item.link,
          },
        },
        select: { id: true },
      });

      if (!existing) {
        targetNews = item;
        break; // Tìm thấy bài mới nhất chưa có trong DB!
      }
    }

    // Nếu toàn bộ tin mới từ RSS đều đã được đăng rồi
    if (!targetNews) {
      console.log(
        "[NewsBot] Tất cả các tin tức RSS mới nhất đều đã được đăng bài trước đó.",
      );
      return {
        message: "Tất cả tin tức mới nhất đã được đăng, không có bài mới.",
        sourceNews: null,
        aiResult: null,
      };
    }

    const news = targetNews;

    // 4. Gọi Gemini AI để tóm tắt và viết lại bài post
    const aiResult = await aiService.generateTweetFromNews(news);

    // Ghép thêm hashtag vào cuối nội dung để Client tự động highlight màu xanh
    const hashtagsFormatted = (aiResult.hashtags || [])
      .map((tag) => `#${tag.replace(/^[#\s]+/, "")}`)
      .join(" ");
    const finalContent = `${aiResult.content}\n\n${hashtagsFormatted}`.trim();

    // 5. Chuẩn bị media ảnh nếu bài báo có thumbnail
    const medias = news.imageUrl
      ? [
          {
            url: news.imageUrl,
            type: MediaType.Image,
          },
        ]
      : [];

    // 6. Đăng bài vào cơ sở dữ liệu qua TweetsService có sẵn
    const createdTweet = await tweetsService.createTweet(
      {
        type: TweetType.TWEET,
        audience: TweetAudienceType.EVERYONE,
        content: finalContent,
        hashtags: aiResult.hashtags,
        mentions: [],
        medias,
      },
      finalUserId,
    );

    return {
      tweet: createdTweet,
      sourceNews: news,
      aiResult,
    };
  }

  private schedulerTimer: NodeJS.Timeout | null = null;
  private isPosting: boolean = false;

  /**
   * Khởi động bộ lập lịch tự động đăng bài sau mỗi khoảng thời gian
   * @param intervalMinutes Thời gian giãn cách giữa các lần đăng (tính bằng phút, mặc định 30 phút)
   * @param feedUrl Link RSS nguồn
   */
  startScheduler(
    intervalMinutes: number = 30,
    feedUrl: string = "https://vnexpress.net/rss/so-hoa.rss",
  ) {
    if (this.schedulerTimer) {
      console.log("[NewsBot] Bộ lập lịch đã đang chạy.");
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;
    console.log(
      `[NewsBot] Đã bật chế độ tự động đăng bài mỗi ${intervalMinutes} phút.`,
    );

    const runTask = async () => {
      if (this.isPosting) return;
      this.isPosting = true;
      try {
        console.log("[NewsBot] Đang kiểm tra tin tức mới từ RSS...");
        const result = await this.autoPostLatestNews(undefined, feedUrl);
        if (result.sourceNews) {
          console.log(
            `[NewsBot] ✅ Đã đăng bài mới thành công: "${result.sourceNews.title}"`,
          );
        }
      } catch (error) {
        console.error("[NewsBot] ❌ Lỗi khi tự động đăng bài:", error);
      } finally {
        this.isPosting = false;
      }
    };

    // Chạy lần đầu sau 10 giây khi khởi động server
    setTimeout(runTask, 10000);

    // Lặp lại định kỳ
    this.schedulerTimer = setInterval(runTask, intervalMs);
  }

  /**
   * Dừng bộ lập lịch tự động
   */
  stopScheduler() {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
      console.log("[NewsBot] Đã dừng bộ lập lịch tự động đăng bài.");
    }
  }
}

const botsService = new BotsService();
export default botsService;
