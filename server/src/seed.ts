import "dotenv/config";
import prisma from "./services/prisma.service";
import { hashPassword } from "./utils/crypto";
import { TweetType, TweetAudience, MediaType, UserVerifyStatus } from "@prisma/client";

const DEFAULT_PASSWORD = hashPassword("123456@Aa");

const SAMPLE_USERS = [
  {
    name: "Quốc Nguyễn",
    username: "ngocquoc",
    email: "quoc@spool.com",
    password: DEFAULT_PASSWORD,
    verify: UserVerifyStatus.Verified,
    bio: "Fullstack Engineer | Building Spool - modern social platform 🚀",
    location: "TP. Hồ Chí Minh, Việt Nam",
    website: "https://github.com/NgoQuoc4",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    cover_photo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Alex Dev",
    username: "alex_dev",
    email: "alex@spool.com",
    password: DEFAULT_PASSWORD,
    verify: UserVerifyStatus.Verified,
    bio: "TypeScript & React enthusiast. Clean code advocate. Coffee lover ☕",
    location: "Đà Nẵng, Việt Nam",
    website: "https://alexdev.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    cover_photo: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Sarah UI/UX",
    username: "sarah_design",
    email: "sarah@spool.com",
    password: DEFAULT_PASSWORD,
    verify: UserVerifyStatus.Verified,
    bio: "Product Designer @ Spool. Obsessed with micro-interactions and dark mode ✨",
    location: "Hà Nội, Việt Nam",
    website: "https://dribbble.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    cover_photo: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Tech Lead Minh",
    username: "minh_lead",
    email: "minh@spool.com",
    password: DEFAULT_PASSWORD,
    verify: UserVerifyStatus.Verified,
    bio: "System Architect | Cloud, Distributed Systems & Database Optimization",
    location: "TP. Hồ Chí Minh",
    website: "https://minh.tech",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    cover_photo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Demo User",
    username: "demouser",
    email: "demo@spool.com",
    password: DEFAULT_PASSWORD,
    verify: UserVerifyStatus.Verified,
    bio: "Tài khoản demo sẵn sàng để bạn đăng nhập thử nghiệm ngay! 🚀",
    location: "Việt Nam",
    website: "http://localhost:3000",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    cover_photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  },
];

const SAMPLE_POSTS = [
  {
    authorUsername: "ngocquoc",
    content: "Chính thức hoàn tất di chuyển hệ thống sang PostgreSQL + Prisma ORM! Tốc độ truy vấn và độ nhất quán dữ liệu được nâng cấp vượt bậc. Anh em dev đánh giá sao về kiến trúc này? #postgresql #prisma #fullstack",
    hashtags: ["postgresql", "prisma", "fullstack"],
    medias: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    ],
    views: 1240,
  },
  {
    authorUsername: "sarah_design",
    content: "Một giao diện Dark Mode chuẩn không bao giờ nên dùng màu đen thuần #000000. Hãy pha một chút tone trầm #0f141c hoặc #121824 kết hợp viền mờ 1px để tạo chiều sâu thị giác cực kỳ sang xịn! 🎨 #design #uiux #spool",
    hashtags: ["design", "uiux", "spool"],
    medias: [
      "https://images.unsplash.com/photo-1581291518655-9523c932deb8?auto=format&fit=crop&w=1200&q=80",
    ],
    views: 890,
  },
  {
    authorUsername: "alex_dev",
    content: "TypeScript 5.x kết hợp TanStack Query và Zustand đang là combo làm hài lòng nhất cho các dự án React phức tạp. Codebase sạch sẽ, không boilerplate thừa, gõ code đến đâu tự tin đến đấy! 💻 #typescript #react #frontend",
    hashtags: ["typescript", "react", "frontend"],
    medias: [],
    views: 650,
  },
  {
    authorUsername: "minh_lead",
    content: "Quy tắc vàng của Senior Developer: Đoạn code tốt nhất là đoạn code không cần phải viết. Trước khi tạo abstraction mới, hãy tự hỏi: Thư viện chuẩn (Standard Library) hoặc tính năng native của nền tảng đã giải quyết được chưa? #architecture #cleancode #yagni",
    hashtags: ["architecture", "cleancode", "yagni"],
    medias: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    ],
    views: 2100,
  },
  {
    authorUsername: "ngocquoc",
    content: "Sắp tới Spool sẽ tích hợp thêm tính năng cột Store gian hàng trực tuyến để anh em vừa giao lưu cộng đồng vừa kinh doanh tiện lợi. Mọi người thích kiểu giao diện gọn gàng hay phong cách hiện đại kiểu card lưới? #ecommerce #store #features",
    hashtags: ["ecommerce", "store", "features"],
    medias: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    ],
    views: 1530,
  },
  {
    authorUsername: "sarah_design",
    content: "Workspace cuối tuần thư giãn trước khi bắt đầu sprint mới. Không gian làm việc tối giản luôn giúp đầu óc thông thoáng và sáng tạo hơn rất nhiều 🌿 Anh em làm việc tại nhà hay lên văn phòng? #workspace #minimalism #weekend",
    hashtags: ["workspace", "minimalism", "weekend"],
    medias: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    ],
    views: 940,
  },
  {
    authorUsername: "alex_dev",
    content: "Infinite scroll mượt mà không bị giật lag với IntersectionObserver + virtualization. Người dùng lướt hàng nghìn post mà RAM browser vẫn duy trì mức cực kỳ nhẹ nhàng! 🔥 #webperf #javascript",
    hashtags: ["webperf", "javascript"],
    medias: [],
    views: 430,
  },
  {
    authorUsername: "demouser",
    content: "Xin chào toàn thể anh em Spool! Mình là thành viên mới gia nhập nền tảng. Rất mong được kết nối và học hỏi cùng mọi người! 👋🚀 #spool #welcome #developer",
    hashtags: ["spool", "welcome", "developer"],
    medias: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    ],
    views: 310,
  },
];

async function main() {
  console.log("🌱 Đang bắt đầu seed dữ liệu mẫu vào PostgreSQL...");

  // 1. Dọn dẹp dữ liệu cũ theo thứ tự quan hệ
  console.log("🧹 Dọn dẹp bảng cũ...");
  await prisma.tweetMedia.deleteMany({});
  await prisma.tweetHashtag.deleteMany({});
  await prisma.tweetMention.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.tweet.deleteMany({});
  await prisma.hashtag.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Tạo Users
  console.log("👥 Đang tạo người dùng mẫu...");
  const createdUsers: Record<string, any> = {};
  for (const u of SAMPLE_USERS) {
    const user = await prisma.user.create({
      data: u,
    });
    createdUsers[u.username] = user;
    console.log(`  + Đã tạo user: @${user.username} (${user.name})`);
  }

  // 3. Tạo quan hệ Follow chéo giữa các users để Feed hiển thị đầy đủ
  console.log("🤝 Đang tạo quan hệ Follow...");
  const userList = Object.values(createdUsers);
  for (const u1 of userList) {
    for (const u2 of userList) {
      if (u1.id !== u2.id) {
        await prisma.follow.create({
          data: {
            user_id: u1.id,
            followed_user_id: u2.id,
          },
        });
      }
    }
  }

  // 4. Tạo Hashtags
  console.log("🏷️  Đang tạo Hashtags...");
  const hashtagMap: Record<string, string> = {};
  const allTags = Array.from(new Set(SAMPLE_POSTS.flatMap((p) => p.hashtags)));
  for (const tag of allTags) {
    const created = await prisma.hashtag.upsert({
      where: { name: tag },
      update: {},
      create: { name: tag },
    });
    hashtagMap[tag] = created.id;
  }

  // 5. Tạo Tweets gốc
  console.log("📝 Đang tạo các bài viết mẫu...");
  const createdTweets: any[] = [];
  for (const post of SAMPLE_POSTS) {
    const author = createdUsers[post.authorUsername];
    if (!author) continue;

    const tweet = await prisma.tweet.create({
      data: {
        user_id: author.id,
        content: post.content,
        type: TweetType.tweet,
        audience: TweetAudience.everyone,
        user_views: post.views,
        guest_views: Math.floor(post.views * 0.3),
        medias: {
          create: post.medias.map((url) => ({
            url,
            type: MediaType.image,
          })),
        },
        hashtags: {
          create: post.hashtags.map((tag) => ({
            hashtag_id: hashtagMap[tag],
          })),
        },
      },
    });
    createdTweets.push(tweet);
    console.log(`  + Đã tạo tweet của @${author.username}: "${post.content.slice(0, 40)}..."`);
  }

  // 6. Tạo Quote Tweet và Repost mẫu
  if (createdTweets.length >= 2) {
    console.log("🔁 Đang tạo Quote Tweet & Retweet mẫu...");
    const targetTweet = createdTweets[0];
    const sarah = createdUsers["sarah_design"];
    const alex = createdUsers["alex_dev"];

    // Quote tweet
    await prisma.tweet.create({
      data: {
        user_id: sarah.id,
        parent_id: targetTweet.id,
        content: "Chúc mừng team Spool! Quá trình migrate sang PostgreSQL rất mượt mà. Hệ thống sẵn sàng cho bước mở rộng tiếp theo 🔥",
        type: TweetType.quote,
        audience: TweetAudience.everyone,
        user_views: 450,
      },
    });

    // Retweet
    await prisma.tweet.create({
      data: {
        user_id: alex.id,
        parent_id: targetTweet.id,
        content: "",
        type: TweetType.retweet,
        audience: TweetAudience.everyone,
        user_views: 280,
      },
    });
  }

  // 7. Tạo Likes và Bookmarks ngẫu nhiên giữa các users
  console.log("❤️  Đang tạo Likes & Bookmarks...");
  for (const tweet of createdTweets) {
    // Like từ 2-4 users
    for (const u of userList.slice(0, 3)) {
      await prisma.like.create({
        data: {
          user_id: u.id,
          tweet_id: tweet.id,
        },
      });
    }
    // Bookmark từ 1-2 users
    await prisma.bookmark.create({
      data: {
        user_id: userList[0].id,
        tweet_id: tweet.id,
      },
    });
  }

  console.log("\n=======================================================");
  console.log("🎉 SEED THÀNH CÔNG VÀO POSTGRESQL!");
  console.log("=======================================================");
  console.log("Bạn có thể đăng nhập thử nghiệm với các tài khoản sau:");
  console.log("  Mật khẩu chung cho mọi tài khoản: 123456@Aa\n");
  for (const u of SAMPLE_USERS) {
    console.log(`  - Email: ${u.email.padEnd(18)} | Username: @${u.username.padEnd(14)} | ${u.name}`);
  }
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
