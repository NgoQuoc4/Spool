const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'twitter-dev';

// Bộ sưu tập ảnh Unsplash chất lượng cao theo chủ đề công nghệ, lập trình, UI/UX, workspace và thiên nhiên
const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80', // Coding IDE
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', // Laptop workspace
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80', // Cafe work
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', // Modern 3D abstract
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', // Web setup MacBook
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80', // HTML CSS code
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // Matrix green cyber
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80', // Dev coding coffee
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80', // UI UX wireframe
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80', // Laptop work desk
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80', // Code editor dark
  'https://images.unsplash.com/photo-1581291518655-9523c932deb8?auto=format&fit=crop&w=1200&q=80', // Design mobile UI
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', // Hardware processor
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', // Team tech meeting
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Cyber network
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80', // Cybersecurity
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', // Startup team
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80', // Mobile app design
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', // Data visualization
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80', // Clean typography
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', // Office workspace
  'https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=1200&q=80', // Developer desk
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80', // Syntax highlighting
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', // Digital connection
  'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80', // Dual monitors setup
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', // Brainstorming
  'https://images.unsplash.com/photo-1550439062-609e15737780?auto=format&fit=crop&w=1200&q=80', // Python terminal
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80', // Minimalist nature
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', // Night starry sky
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80', // Cozy office workspace
];

const POST_CONTENTS = [
  'React 19 Server Components thật sự đã định hình lại tư duy phát triển web hiện đại. Việc xử lý data fetching ngay trên server mang lại trải nghiệm cực nhanh.',
  'Hôm nay vừa refactor xong toàn bộ codebase từ Redux Toolkit sang TanStack Query + Context API. Codebase gọn hơn gần 40% mà không mất đi tính năng nào!',
  'Tips nhỏ cho các bạn làm việc với MongoDB Aggregation: Hãy luôn đặt stage $match và $sort lên đầu pipeline để tận dụng tối đa Index.',
  'Có ai gặp lỗi memory leak khi sử dụng useEffect mà quên cleanup Event Listener hoặc AbortController chưa? Cực kỳ khó debug nếu không monitor cẩn thận.',
  'Giao diện Dark Mode chuẩn không chỉ đơn giản là đổi màu nền sang đen #000000. Hãy sử dụng các sắc thái xám trầm như #121212 để giữ độ tương phản êm dịu cho mắt.',
  'TypeScript 5.x với Const Type Parameters và Decorators mới đã làm cho việc viết generic type trở nên trực quan hơn rất nhiều.',
  'Sự khác biệt lớn nhất giữa Senior và Junior không phải là số dòng code viết ra, mà là khả năng nhận biết đoạn code nào KHÔNG cần phải viết (YAGNI).',
  'Một ngày làm việc hiệu quả bắt đầu bằng việc giải quyết task khó nhất trước. Sau 11h trưa thì năng lượng dành cho việc tư duy sâu sẽ giảm dần.',
  'Cấu hình Vite + React + ESLint Flat Config + Prettier chuẩn chỉ cho dự án fullstack mới. Mọi thứ khởi động trong chưa đầy 200ms!',
  'Dockerizing ứng dụng Node.js với Multi-stage build giúp giảm dung lượng image từ 1.2GB xuống chỉ còn vỏn vẹn 95MB. Rất đáng để áp dụng.',
  'Micro-frontend có thật sự cần thiết? Nếu đội ngũ của bạn dưới 20 lập trình viên, một Modular Monolith luôn mang lại hiệu suất làm việc cao hơn.',
  'Chia sẻ cuốn sách tâm đắc: "Designing Data-Intensive Applications" của Martin Kleppmann. Bất cứ ai làm Backend cũng nên đọc ít nhất một lần trong đời.',
  'JWT Refresh Token Rotation: Mỗi khi cấp Access Token mới, hãy hủy Refresh Token cũ và cấp mới một Refresh Token khác để ngăn chặn replay attack.',
  'CSS Grid vs Flexbox: Khi nào nên dùng cái nào? Nguyên tắc đơn giản: Flexbox cho bố cục 1 chiều (hàng hoặc cột), CSS Grid cho bố cục 2 chiều.',
  'Hôm nay triển khai thành công tính năng Infinite Scroll cho Feed với IntersectionObserver. Trải nghiệm mượt mà không hề bị giật lag khung hình.',
  'Prompt Engineering cho lập trình: Hãy cung cấp ngữ cảnh rõ ràng, cấu trúc dữ liệu mong muốn và các trường hợp biên trước khi yêu cầu AI viết code.',
  'Tối ưu hóa hình ảnh web: Hãy chuyển sang định dạng WebP hoặc AVIF kết hợp responsive srcset. Tốc độ tải trang First Contentful Paint (FCP) cải thiện rõ rệt.',
  'Viết Unit Test bằng Vitest nhanh hơn Jest đáng kể nhờ chia sẻ cùng pipeline build với Vite. Ai chưa thử thì nên trải nghiệm ngay nhé.',
  'Kiến trúc Clean Architecture: Domain -> Application -> Infrastructure -> Presentation. Giúp tách biệt hoàn toàn business logic khỏi framework bên ngoài.',
  'Thói quen code mỗi ngày: Dành 15 phút đọc lại PR của đồng nghiệp để học hỏi các pattern hay và tìm ra góc nhìn mới cho bài toán.',
  'WebSockets vs Server-Sent Events (SSE): Nếu chỉ cần gửi dữ liệu 1 chiều từ server xuống client (như thông báo, feed realtime), SSE nhẹ và ổn định hơn rất nhiều.',
  'Đã bạn nào thử nghiệm Bun.js trong production chưa? Tốc độ cài đặt package và startup script ấn tượng thực sự!',
  'Bảo mật API: Đừng bao giờ quên validate dữ liệu đầu vào cả ở Frontend lẫn Backend. Luôn coi request từ client là không đáng tin cậy.',
  'Một mẹo nhỏ với Git: git switch thay cho git checkout nhánh, git restore thay cho việc revert file. Cú pháp mới từ Git 2.23 rất dễ nhớ.',
  'Thiết kế database cho mạng xã hội: Nên denormalize những trường dữ liệu thường xuyên đọc như số like, số comment để giảm tải aggregation queries.',
];

const QUOTE_CONTENTS = [
  'Quan điểm rất chuẩn xác! Nhiều khi dev cứ mải mê tối ưu sớm (premature optimization) mà quên mất tính đơn giản của bài toán.',
  'Một bài viết rất đáng để suy ngẫm cho các bạn đang làm việc với React và TypeScript.',
  'Thực tế áp dụng vào production còn nhiều edge case phải xử lý, nhưng đây là hướng tiếp cận rất sạch và dễ maintain.',
  'Bookmark lại ngay để áp dụng cho đợt refactor sprint tới 🔥 Anh em tham khảo nhé!',
  'Đồng ý 100%! Sự khác biệt giữa code chạy được và code sống được qua 3 năm nằm ở chính tư duy này.',
  'Đã từng đau đầu vì vấn đề này suốt cả tuần trước. Cảm ơn vì chia sẻ rất chi tiết và hữu ích!',
  'Góc nhìn rất thực tế về kiến trúc hệ thống hiện đại. Không nhất thiết lúc nào cũng phải chạy theo microservices.',
  'Chuẩn không cần chỉnh! Tối ưu trải nghiệm người dùng (UX) và tốc độ tải trang luôn phải là ưu tiên số một.',
  'Bài viết giải thích rất trực quan, dễ hiểu hơn hẳn tài liệu chính thức của thư viện.',
  'Anh em trong team nên đọc bài này nhé, đặc biệt là phần xử lý memory leak và cleanup effect.',
  'Thêm một tip nữa: Đừng quên viết unit test bao phủ các trường hợp biên trước khi deploy lên production.',
  'Kiến thức rất thực chiến! Cảm ơn tác giả đã tổng hợp và chia sẻ cho cộng đồng tech.',
];

async function seed100() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB:', dbName);
    const db = client.db(dbName);

    const usersCol = db.collection('users');
    const tweetsCol = db.collection('tweets');
    const hashtagsCol = db.collection('hashtags');
    const followsCol = db.collection('follows');
    const likesCol = db.collection('likes');
    const bookmarksCol = db.collection('bookmarks');

    const users = await usersCol.find({}).toArray();
    if (users.length === 0) {
      console.error('❌ Không tìm thấy user nào trong database!');
      return;
    }

    const hashtags = await hashtagsCol.find({}).toArray();
    const hashtagIds = hashtags.map((h) => h._id);

    console.log(`🧹 Đang dọn dẹp dữ liệu tweets, likes, bookmarks cũ...`);
    await tweetsCol.deleteMany({});
    await likesCol.deleteMany({});
    await bookmarksCol.deleteMany({});

    // Đảm bảo tất cả user follow lẫn nhau để feed hiển thị đầy đủ
    for (const u1 of users) {
      for (const u2 of users) {
        if (!u1._id.equals(u2._id)) {
          const exists = await followsCol.findOne({
            user_id: u1._id,
            followed_user_id: u2._id,
          });
          if (!exists) {
            await followsCol.insertOne({
              _id: new ObjectId(),
              user_id: u1._id,
              followed_user_id: u2._id,
              created_at: new Date(),
            });
          }
        }
      }
    }

    console.log(`🌱 Bắt đầu tạo 100 bài post mẫu (gồm Original tweets, Repost, Quote và đa dạng 2-4 ảnh)...`);

    const now = Date.now();
    const totalOriginal = 70;
    const totalReposts = 18;
    const totalQuotes = 12;

    const originalTweets = [];

    // Phân bố số lượng ảnh cho các bài post gốc (ưu tiên đa dạng 2 - 4 hình ảnh)
    // Chu kỳ lặp: [4, 2, 3, 4, 2, 3, 1, 0]
    const imageCountPattern = [4, 2, 3, 4, 2, 3, 1, 0];

    let imgCursor = 0;
    for (let i = 0; i < totalOriginal; i++) {
      const user = users[i % users.length];
      const baseContent = POST_CONTENTS[i % POST_CONTENTS.length];
      const content = `${baseContent} #${i + 1}`;

      const imgCount = imageCountPattern[i % imageCountPattern.length];
      const medias = [];

      for (let m = 0; m < imgCount; m++) {
        medias.push({
          url: UNSPLASH_IMAGES[imgCursor % UNSPLASH_IMAGES.length],
          type: 'image',
        });
        imgCursor++;
      }

      // 1-2 Hashtags
      const tweetHashtags = [];
      if (hashtagIds.length > 0) {
        const tag1 = hashtagIds[i % hashtagIds.length];
        tweetHashtags.push(tag1);
        if (i % 3 === 0 && hashtagIds.length > 1) {
          const tag2 = hashtagIds[(i + 2) % hashtagIds.length];
          if (!tag2.equals(tag1)) tweetHashtags.push(tag2);
        }
      }

      // Thời gian tạo: trải dài từ 15 ngày trước tới 1 giờ trước
      const timeOffsetMinutes = (totalOriginal - i) * 300 + Math.floor(Math.random() * 60);
      const createdAt = new Date(now - timeOffsetMinutes * 60 * 1000);

      originalTweets.push({
        _id: new ObjectId(),
        user_id: user._id,
        type: 'tweet',
        audience: 'everyone',
        content,
        parent_id: null,
        hashtags: tweetHashtags,
        mentions: [],
        medias,
        like: 0,
        bookmark: 0,
        user_views: Math.floor(Math.random() * 3500) + 150,
        guest_views: Math.floor(Math.random() * 1200) + 40,
        created_at: createdAt,
        updated_at: createdAt,
      });
    }

    // 2. Tạo Repost (Retweets): type: 'retweet', content: '', medias: [], parent_id: tweet gốc
    const repostTweets = [];
    for (let r = 0; r < totalReposts; r++) {
      // Chọn 1 bài gốc ngẫu nhiên / xoay vòng
      const parentTweet = originalTweets[(r * 3 + 2) % originalTweets.length];
      // Chọn user repost khác với tác giả bài gốc
      const availableUsers = users.filter((u) => !u._id.equals(parentTweet.user_id));
      const reposter = availableUsers.length > 0 ? availableUsers[r % availableUsers.length] : users[(r + 1) % users.length];

      // Thời gian repost diễn ra sau bài gốc
      const parentTime = parentTweet.created_at.getTime();
      const repostTime = new Date(parentTime + Math.random() * (now - parentTime));

      repostTweets.push({
        _id: new ObjectId(),
        user_id: reposter._id,
        type: 'retweet',
        audience: 'everyone',
        content: '',
        parent_id: parentTweet._id,
        hashtags: [],
        mentions: [],
        medias: [],
        like: 0,
        bookmark: 0,
        user_views: Math.floor(Math.random() * 1200) + 50,
        guest_views: Math.floor(Math.random() * 400) + 20,
        created_at: repostTime,
        updated_at: repostTime,
      });
    }

    // 3. Tạo Quote Tweets: type: 'quote', có nội dung bình luận, parent_id: tweet gốc, có thể có 1-2 ảnh minh họa
    const quoteTweets = [];
    for (let q = 0; q < totalQuotes; q++) {
      const parentTweet = originalTweets[(q * 4 + 5) % originalTweets.length];
      const availableUsers = users.filter((u) => !u._id.equals(parentTweet.user_id));
      const quoter = availableUsers.length > 0 ? availableUsers[q % availableUsers.length] : users[(q + 2) % users.length];

      const parentTime = parentTweet.created_at.getTime();
      const quoteTime = new Date(parentTime + Math.random() * (now - parentTime));

      // 40% Quote tweet đính kèm thêm 1-2 hình ảnh
      const quoteMedias = [];
      if (q % 3 === 0) {
        quoteMedias.push({
          url: UNSPLASH_IMAGES[imgCursor % UNSPLASH_IMAGES.length],
          type: 'image',
        });
        imgCursor++;
      } else if (q % 5 === 0) {
        quoteMedias.push({
          url: UNSPLASH_IMAGES[imgCursor % UNSPLASH_IMAGES.length],
          type: 'image',
        });
        imgCursor++;
        quoteMedias.push({
          url: UNSPLASH_IMAGES[imgCursor % UNSPLASH_IMAGES.length],
          type: 'image',
        });
        imgCursor++;
      }

      const quoteHashtags = [];
      if (hashtagIds.length > 0) {
        quoteHashtags.push(hashtagIds[q % hashtagIds.length]);
      }

      quoteTweets.push({
        _id: new ObjectId(),
        user_id: quoter._id,
        type: 'quote',
        audience: 'everyone',
        content: QUOTE_CONTENTS[q % QUOTE_CONTENTS.length],
        parent_id: parentTweet._id,
        hashtags: quoteHashtags,
        mentions: [],
        medias: quoteMedias,
        like: 0,
        bookmark: 0,
        user_views: Math.floor(Math.random() * 2000) + 100,
        guest_views: Math.floor(Math.random() * 600) + 30,
        created_at: quoteTime,
        updated_at: quoteTime,
      });
    }

    const allTweets = [...originalTweets, ...repostTweets, ...quoteTweets];

    // Chèn toàn bộ 100 bài post vào database
    const insertResult = await tweetsCol.insertMany(allTweets);
    console.log(`✅ Đã chèn thành công ${insertResult.insertedCount} bài post vào MongoDB!`);

    // Tạo dữ liệu likes và bookmarks mẫu thực tế
    console.log('❤️  Đang tạo dữ liệu Likes & Bookmarks tương tác...');
    const likesToInsert = [];
    const bookmarksToInsert = [];

    for (const tweet of allTweets) {
      // Mỗi user có xác suất tương tác like / bookmark
      for (const user of users) {
        if (Math.random() < 0.45) {
          likesToInsert.push({
            _id: new ObjectId(),
            user_id: user._id,
            tweet_id: tweet._id,
            created_at: new Date(tweet.created_at.getTime() + 10000),
          });
        }
        if (Math.random() < 0.2) {
          bookmarksToInsert.push({
            _id: new ObjectId(),
            user_id: user._id,
            tweet_id: tweet._id,
            created_at: new Date(tweet.created_at.getTime() + 20000),
          });
        }
      }
    }

    if (likesToInsert.length > 0) {
      await likesCol.insertMany(likesToInsert);
    }
    if (bookmarksToInsert.length > 0) {
      await bookmarksCol.insertMany(bookmarksToInsert);
    }

    // Cập nhật lại số like, bookmark tổng trên tweets bằng bulkWrite
    const bulkOps = allTweets.map((tweet) => {
      const lCount = likesToInsert.filter((l) => l.tweet_id.equals(tweet._id)).length;
      const bCount = bookmarksToInsert.filter((b) => b.tweet_id.equals(tweet._id)).length;
      return {
        updateOne: {
          filter: { _id: tweet._id },
          update: { $set: { like: lCount, bookmark: bCount } },
        },
      };
    });
    if (bulkOps.length > 0) {
      await tweetsCol.bulkWrite(bulkOps);
    }

    // Thống kê chi tiết
    const countsByImages = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0 };
    for (const t of originalTweets) {
      const len = String(t.medias.length);
      countsByImages[len] = (countsByImages[len] || 0) + 1;
    }

    console.log(`\n================= THỐNG KÊ SEED DỮ LIỆU =================`);
    console.log(`📝 Tổng số bài post: ${allTweets.length}`);
    console.log(`  - Original Tweets: ${originalTweets.length}`);
    console.log(`    + 4 ảnh: ${countsByImages['4']} bài`);
    console.log(`    + 3 ảnh: ${countsByImages['3']} bài`);
    console.log(`    + 2 ảnh: ${countsByImages['2']} bài`);
    console.log(`    + 1 ảnh: ${countsByImages['1']} bài`);
    console.log(`    + Không ảnh (Text): ${countsByImages['0']} bài`);
    console.log(`  - Reposts (Retweets): ${repostTweets.length} bài`);
    console.log(`  - Quote Tweets: ${quoteTweets.length} bài`);
    console.log(`❤️  Tổng số Likes mẫu đã tạo: ${likesToInsert.length}`);
    console.log(`🔖 Tổng số Bookmarks mẫu đã tạo: ${bookmarksToInsert.length}`);
    console.log(`=========================================================\n`);
  } catch (error) {
    console.error('Lỗi khi seed 100 bài post:', error);
  } finally {
    await client.close();
    console.log('Đã đóng kết nối MongoDB.');
  }
}

seed100();
