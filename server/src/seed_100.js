const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: 'e:/FullStack/twitter/server/.env' });

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'twitter-dev';

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581291518655-9523c932deb8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
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

    const users = await usersCol.find({}).toArray();
    if (users.length === 0) {
      console.error('Không tìm thấy user nào trong database!');
      return;
    }

    const hashtags = await hashtagsCol.find({}).toArray();
    const hashtagIds = hashtags.map((h) => h._id);

    console.log(`Đang tạo 100 bài post mẫu cho ${users.length} users...`);

    const newTweets = [];
    const now = Date.now();

    for (let i = 0; i < 100; i++) {
      const user = users[i % users.length];
      const baseContent = POST_CONTENTS[i % POST_CONTENTS.length];
      const content = `${baseContent} #${i + 1}`;

      // 40% bài post có ảnh
      const hasImage = i % 2 === 0 || i % 5 === 0;
      const medias = hasImage
        ? [
            {
              url: UNSPLASH_IMAGES[i % UNSPLASH_IMAGES.length],
              type: 'image',
            },
          ]
        : [];

      // Chọn ngẫu nhiên 1-2 hashtags
      const tweetHashtags = [];
      if (hashtagIds.length > 0) {
        const tag1 = hashtagIds[i % hashtagIds.length];
        tweetHashtags.push(tag1);
        if (i % 3 === 0 && hashtagIds.length > 1) {
          const tag2 = hashtagIds[(i + 2) % hashtagIds.length];
          if (!tag2.equals(tag1)) tweetHashtags.push(tag2);
        }
      }

      // Giãn cách thời gian: từ vài phút trước cho tới 20 ngày trước
      const timeOffsetMinutes = i * 280 + Math.floor(Math.random() * 60);
      const createdAt = new Date(now - timeOffsetMinutes * 60 * 1000);

      newTweets.push({
        _id: new ObjectId(),
        user_id: user._id,
        type: 'tweet',
        audience: 'everyone',
        content,
        parent_id: null,
        hashtags: tweetHashtags,
        mentions: [],
        medias,
        like: Math.floor(Math.random() * 180) + 5,
        bookmark: Math.floor(Math.random() * 45) + 1,
        user_views: Math.floor(Math.random() * 3500) + 200,
        guest_views: Math.floor(Math.random() * 1200) + 50,
        created_at: createdAt,
        updated_at: createdAt,
      });
    }

    // Đảm bảo tất cả user follow nhau để hiển thị đủ 100 bài
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

    const insertResult = await tweetsCol.insertMany(newTweets);
    console.log(`✅ Đã chèn thành công ${insertResult.insertedCount} bài post vào MongoDB!`);

    const totalTweets = await tweetsCol.countDocuments();
    console.log(`📊 Tổng số bài post hiện tại trong DB: ${totalTweets}`);
  } catch (error) {
    console.error('Lỗi khi seed 100 bài post:', error);
  } finally {
    await client.close();
    console.log('Đã đóng kết nối MongoDB.');
  }
}

seed100();
