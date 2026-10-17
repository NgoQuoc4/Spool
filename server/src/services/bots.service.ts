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
    this.parser = new Parser({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      timeout: 15000,
      customFields: {
        item: [
          ["media:content", "mediaContent", { keepArray: true }],
          ["media:thumbnail", "mediaThumbnail"],
          ["content:encoded", "contentEncoded"],
          ["description", "description"],
          ["image", "image"],
        ],
      },
    });
  }

  /**
   * Bóc tách link ảnh thumbnail từ nhiều chuẩn RSS khác nhau (enclosure, media:content, media:thumbnail, <image> tag, thẻ img trong html)
   */
  private extractImageUrl(item: any): string | undefined {
    // 1. Chuẩn RSS 2.0 Enclosure (Dân Trí, Thanh Niên, VietnamNet...)
    if (item.enclosure?.url) {
      const encUrl = item.enclosure.url;
      const type = item.enclosure.type || "";
      if (
        type.includes("image") ||
        /\.(jpe?g|png|webp|gif|avif)($|\?)/i.test(encUrl)
      ) {
        return encUrl;
      }
    }

    // 2. Chuẩn Media RSS media:content (BBC, CNN, TechCrunch, Zing...)
    if (item.mediaContent) {
      const mediaList = Array.isArray(item.mediaContent)
        ? item.mediaContent
        : [item.mediaContent];
      for (const m of mediaList) {
        const url = m?.$?.url || m?.url;
        if (url && typeof url === "string") {
          return url;
        }
      }
    }

    // 3. Chuẩn Media RSS media:thumbnail
    if (item.mediaThumbnail) {
      const thumb = Array.isArray(item.mediaThumbnail)
        ? item.mediaThumbnail[0]
        : item.mediaThumbnail;
      const url = thumb?.$?.url || thumb?.url;
      if (url && typeof url === "string") {
        return url;
      }
    }

    // 4. Thẻ <image> trực tiếp trong item (Tinh Tế / TinhTe.vn, diễn đàn XenForo...)
    if (item.image) {
      const raw =
        typeof item.image === "string"
          ? item.image
          : item.image?.url || item.image?._;
      if (raw && typeof raw === "string") {
        let src = raw.trim();
        if (src.startsWith("//")) src = `https:${src}`;
        return src;
      }
    }

    // 5. Bóc tách thẻ <img src="..."> từ description, content, content:encoded (VnExpress, Tuổi Trẻ, Medium...)
    const htmlPool = [
      item["content:encoded"],
      item.contentEncoded,
      item.content,
      item.description,
      item.summary,
    ]
      .filter(Boolean)
      .join(" ");

    const match = htmlPool.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) {
      let src = match[1].trim();
      if (src.startsWith("//")) {
        src = `https:${src}`;
      }
      return src;
    }

    return undefined;
  }

  /**
   * Làm sạch văn bản: xóa thẻ HTML và giải mã các thực thể HTML phổ biến
   */
  private cleanText(rawText: string): string {
    if (!rawText) return "";
    return rawText
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Lấy hoặc tự động tạo tài khoản Bot hệ thống nếu chưa tồn tại
   */
  async getOrCreateBotUser() {
    const botEmail = "newsbot@system.local";

    const { botUser, botSetting } = await prisma.$transaction(async (tx) => {
      const botUser = await tx.user.upsert({
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

      const botSetting = await tx.botSetting.upsert({
        where: {
          user_id: botUser.id,
        },
        update: {},
        create: {
          user_id: botUser.id,
          rss_url: "https://vnexpress.net/rss/so-hoa.rss",
          interval_minutes: 10,
          post_limit: 5,
          is_active: true,
        },
      });

      return { botUser, botSetting };
    });
    return { botUser, botSetting };
  }

  /**
   * Lấy danh sách tin tức từ đường dẫn RSS
   * @param feedUrl Link RSS (mặc định là mục Số hóa / Công nghệ của VnExpress)
   * @param limit Số lượng bài muốn lấy (mặc định lấy 5 bài mới nhất)
   */
  async getLatestNews(
    feedUrl: string = "https://vnexpress.net/rss/so-hoa.rss",
    limit: number = 15,
  ): Promise<NewsItem[]> {
    try {
      const feed = await this.parser.parseURL(feedUrl);

      const items: NewsItem[] = (feed.items || [])
        .slice(0, limit)
        .map((item: any) => {
          const imageUrl = this.extractImageUrl(item);

          // Bóc link: ưu tiên link, nếu không có lấy guid dạng url hoặc origlink
          const rawLink =
            item.link ||
            (typeof item.guid === "string" && item.guid.startsWith("http")
              ? item.guid
              : "") ||
            item.origlink ||
            "";

          // Tóm tắt nội dung: kiểm tra lần lượt các trường phổ biến
          const rawSummary =
            item.contentSnippet ||
            item.summary ||
            item.description ||
            item.contentEncoded ||
            item["content:encoded"] ||
            item.content ||
            "";
          const cleanSummary = this.cleanText(rawSummary);

          return {
            title: this.cleanText(item.title || ""),
            link: rawLink.trim(),
            summary: cleanSummary,
            pubDate: item.pubDate || item.isoDate,
            imageUrl,
          };
        });

      return items;
    } catch (error) {
      console.error(`Lỗi khi đọc tin tức từ RSS [${feedUrl}]:`, error);
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
    // getBotSettingById
    // 1. Nếu không truyền userId, tự động lấy hoặc tạo tài khoản Bot
    const finalUserId = userId || (await this.getOrCreateBotUser()).botUser.id;

    const botSetting = await prisma.botSetting.findUnique({
      where: { user_id: finalUserId },
    });

    if (botSetting && !botSetting.is_active) {
      console.log(`[NewsBot] Bot ${finalUserId} đang tắt (is_active = false).`);
      return { message: "Bot đang tắt, bỏ qua lượt quét tin." };
    }
    const rssUrl =
      botSetting?.rss_url || "https://vnexpress.net/rss/so-hoa.rss";
    const postLimit = botSetting?.post_limit || 1;
    // 2. Lấy danh sách 15 tin mới nhất từ RSS để kiểm tra trùng lặp
    const newsList = await this.getLatestNews(rssUrl, 15);
    if (!newsList || newsList.length === 0) {
      throw new Error("Không tìm thấy tin tức nào từ RSS");
    }

    // 3. Tìm bài viết mới nhất mà trong DB chưa từng đăng (dựa theo link bài báo)
    let targetNewsList: NewsItem[] = [];
    for (const item of newsList) {
      if (targetNewsList.length >= postLimit) break;
      const existing = await prisma.tweet.findFirst({
        where: {
          content: {
            contains: item.link,
          },
        },
        select: { id: true },
      });

      if (!existing) {
        targetNewsList.push(item);
      }
    }

    // Nếu toàn bộ tin mới từ RSS đều đã được đăng rồi
    if (targetNewsList.length === 0) {
      console.log(
        "[NewsBot] Tất cả các tin tức RSS mới nhất đều đã được đăng bài trước đó.",
      );
      return {
        message: "Tất cả tin tức mới nhất đã được đăng, không có bài mới.",
      };
    }

    // Đăng lần lượt các bài mới tìm được
    const postedResults = [];
    for (const news of targetNewsList) {
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

      postedResults.push({ tweet: createdTweet, sourceNews: news, aiResult });
    }

    return { results: postedResults };
  }

  private schedulerTimer: NodeJS.Timeout | null = null;
  private startupTimeout: NodeJS.Timeout | null = null;
  private isPosting: boolean = false;

  /**
   * Khởi động scheduler dựa trên cấu hình trong database lúc start server
   */
  async initScheduler() {
    const { botSetting } = await this.getOrCreateBotUser();
    if (botSetting && botSetting.is_active) {
      this.startScheduler(botSetting.interval_minutes, botSetting.rss_url);
    } else {
      console.log(
        "[NewsBot] Bot đang tắt (is_active = false), không khởi động bộ lập lịch.",
      );
    }
  }

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
        const result = await this.autoPostLatestNews();
        if (
          "results" in result &&
          result.results &&
          result.results.length > 0
        ) {
          console.log(
            `[NewsBot] ✅ Đã đăng ${result.results.length} bài mới thành công.`,
          );
        } else if ("message" in result) {
          console.log(`[NewsBot] ℹ️ ${result.message}`);
        }
      } catch (error: any) {
        if (error.status === 429) {
          console.log(
            "Hết hạn mức ---[NewsBot] ❌ Lỗi khi tự động đăng bài: Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-2.5-flash",
          );
        } else {
          console.log("[NewsBot] ❌ Lỗi khi tự động đăng bài:", error);
        }
      } finally {
        this.isPosting = false;
      }
    };

    // Chạy lần đầu sau 10 giây khi khởi động server
    this.startupTimeout = setTimeout(runTask, 10000);

    // Lặp lại định kỳ
    this.schedulerTimer = setInterval(runTask, intervalMs);
  }

  /**
   * Dừng bộ lập lịch tự động
   */
  stopScheduler() {
    if (this.startupTimeout) {
      clearTimeout(this.startupTimeout);
      this.startupTimeout = null;
    }
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
      console.log("[NewsBot] Đã dừng bộ lập lịch tự động đăng bài.");
    }
  }

  restartScheduler(
    newInterval: number = 30,
    feedUrl: string = "https://vnexpress.net/rss/so-hoa.rss",
  ) {
    this.stopScheduler();
    this.startScheduler(newInterval, feedUrl);
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
          botSettings: {
            select: {
              id: true,
              rss_url: true,
              interval_minutes: true,
              post_limit: true,
              is_active: true,
            },
          },
        },
      }),
      prisma.user.count({
        where: {
          role: "Bot",
        },
      }),
    ]);
    const mappedBots = bots.map((b) => ({
      ...b,
      botSettings: b.botSettings
        ? {
            id: b.botSettings.id,
            rssUrl: b.botSettings.rss_url,
            intervalMinutes: b.botSettings.interval_minutes,
            postLimit: b.botSettings.post_limit,
            isActive: b.botSettings.is_active,
          }
        : null,
    }));
    return { bots: mappedBots, totalItems };
  }

  async getBotSettingById(bot_id: string) {
    const bot = await prisma.botSetting.findUnique({
      where: {
        user_id: bot_id,
      },
      select: {
        id: true,
        user_id: true,
        rss_url: true,
        interval_minutes: true,
        post_limit: true,
        is_active: true,
        updated_at: true,
      },
    });
    if (!bot) throw new Error("Bot not found");
    return {
      id: bot.id,
      userId: bot.user_id,
      rssUrl: bot.rss_url,
      intervalMinutes: bot.interval_minutes,
      postLimit: bot.post_limit,
      isActive: bot.is_active,
      updatedAt: bot.updated_at,
    };
  }

  async updateBotSettings(bot_id: string, payload: any) {
    const bot = await prisma.botSetting.findUnique({
      where: {
        user_id: bot_id,
      },
    });
    if (!bot) throw new Error("Bot not found");

    const updateData: any = {};
    if (payload.rssUrl !== undefined) {
      updateData.rss_url = payload.rssUrl;
    }
    if (payload.intervalMinutes !== undefined) {
      updateData.interval_minutes = payload.intervalMinutes;
    }
    if (payload.postLimit !== undefined) {
      updateData.post_limit = payload.postLimit;
    }
    if (payload.isActive !== undefined) {
      updateData.is_active = payload.isActive;
    }

    const botSetting = await prisma.botSetting.update({
      where: {
        user_id: bot_id,
      },
      data: updateData,
    });

    // Đồng bộ trạng thái scheduler theo is_active và interval_minutes
    if (botSetting.is_active) {
      this.restartScheduler(botSetting.interval_minutes, botSetting.rss_url);
    } else {
      this.stopScheduler();
    }

    return {
      id: botSetting.id,
      userId: botSetting.user_id,
      rssUrl: botSetting.rss_url,
      intervalMinutes: botSetting.interval_minutes,
      postLimit: botSetting.post_limit,
      isActive: botSetting.is_active,
      updatedAt: botSetting.updated_at,
    };
  }
}

const botsService = new BotsService();
export default botsService;
