const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: 'e:/FullStack/twitter/server/.env' });

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'twitter-dev';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB:', dbName);
    const db = client.db(dbName);

    const usersCol = db.collection('users');
    const tweetsCol = db.collection('tweets');
    const hashtagsCol = db.collection('hashtags');
    const followsCol = db.collection('follows');

    // 1. Cập nhật và làm sạch các user hiện tại
    const existingUsers = await usersCol.find({}).toArray();
    console.log(`Tìm thấy ${existingUsers.length} user hiện tại.`);

    for (const u of existingUsers) {
      const cleanUsername = (u.username || '').trim();
      const avatar = u.avatar && u.avatar.trim() !== ''
        ? u.avatar
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
      await usersCol.updateOne(
        { _id: u._id },
        {
          $set: {
            username: cleanUsername,
            avatar,
            bio: u.bio || 'Software Engineer & Fullstack Developer 🚀',
            updated_at: new Date(),
          },
        }
      );
    }

    // 2. Tạo thêm 3 user mẫu nếu chưa có
    const demoAccounts = [
      {
        name: 'Spool Official',
        username: 'spool',
        email: 'spool.official@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
        bio: 'Welcome to Spool — open conversations, community and media.',
        verify: 1,
      },
      {
        name: 'Sarah Chen',
        username: 'sarah_codes',
        email: 'sarah.codes@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        bio: 'Frontend Architect 💻 Passionate about React, TypeScript & Web Performance.',
        verify: 1,
      },
      {
        name: 'Alex Rivera',
        username: 'alexdesign',
        email: 'alex.rivera@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bio: 'UI/UX Designer & Creative Technologist 🎨 Designing intuitive digital products.',
        verify: 1,
      },
    ];

    const demoUserIds = [];
    for (const acc of demoAccounts) {
      let user = await usersCol.findOne({ email: acc.email });
      if (!user) {
        const insertRes = await usersCol.insertOne({
          _id: new ObjectId(),
          name: acc.name,
          username: acc.username,
          email: acc.email,
          password: '5331821efb0ddf090cb73690150691869d9aa15519071d8fc810ee07417e0437',
          date_of_birth: new Date('1998-05-15'),
          created_at: new Date(),
          updated_at: new Date(),
          email_verify_token: '',
          forgot_password_token: '',
          verify: acc.verify,
          bio: acc.bio,
          location: 'Danang, Vietnam',
          website: 'https://spool.app',
          avatar: acc.avatar,
          cover_photo: '',
        });
        demoUserIds.push(insertRes.insertedId);
      } else {
        demoUserIds.push(user._id);
      }
    }

    // Lấy lại danh sách tất cả users
    const allUsers = await usersCol.find({}).toArray();
    console.log(`Tổng số user sau cập nhật: ${allUsers.length}`);

    // 3. Tạo Hashtags mẫu
    const hashtagNames = ['spool', 'react', 'fullstack', 'javascript', 'webdev', 'tech', 'ai'];
    const hashtagMap = {};
    for (const tag of hashtagNames) {
      let found = await hashtagsCol.findOne({ name: tag });
      if (!found) {
        const res = await hashtagsCol.insertOne({
          _id: new ObjectId(),
          name: tag,
          created_at: new Date(),
        });
        hashtagMap[tag] = res.insertedId;
      } else {
        hashtagMap[tag] = found._id;
      }
    }

    // 4. Thiết lập quan hệ Follow (để mọi user đều thấy bài viết của nhau)
    for (const u1 of allUsers) {
      for (const u2 of allUsers) {
        if (!u1._id.equals(u2._id)) {
          const followExists = await followsCol.findOne({
            user_id: u1._id,
            followed_user_id: u2._id,
          });
          if (!followExists) {
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
    console.log('Đã cập nhật quan hệ follows giữa các user.');

    // 5. Danh sách các bài Post (Tweet) mẫu chất lượng cao
    const uSpool = allUsers.find(u => u.username === 'spool') || allUsers[0];
    const uSarah = allUsers.find(u => u.username === 'sarah_codes') || allUsers[0];
    const uAlex = allUsers.find(u => u.username === 'alexdesign') || allUsers[0];
    const uQuoc = allUsers.find(u => u.username.includes('ngochiquoc')) || allUsers[0];

    const sampleTweets = [
      {
        user_id: uSpool._id,
        content: 'Chào mừng bạn đến với Spool! 🧵 Nơi chia sẻ mọi suy nghĩ, trao đổi công nghệ và kết nối cùng cộng đồng lập trình viên trên toàn thế giới.',
        hashtags: [hashtagMap['spool'], hashtagMap['webdev']],
        medias: [
          {
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            type: 'image',
          },
        ],
        like: 48,
        bookmark: 12,
        user_views: 1250,
        guest_views: 450,
        created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 phút trước
      },
      {
        user_id: uQuoc._id,
        content: 'Hôm nay vừa hoàn thiện tích hợp TanStack Query v5 và Infinite Scroll cho Newsfeed. Trải nghiệm tải trang và cuộn vô tận cực kỳ mượt mà! 🚀💻',
        hashtags: [hashtagMap['react'], hashtagMap['fullstack']],
        medias: [
          {
            url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
            type: 'image',
          },
        ],
        like: 34,
        bookmark: 9,
        user_views: 890,
        guest_views: 210,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 giờ trước
      },
      {
        user_id: uSarah._id,
        content: 'React 19 Server Actions và Hook useActionState thực sự thay đổi cách chúng ta xử lý form và mutation. Đỡ phải viết hàng chục dòng boilerplate code như trước!',
        hashtags: [hashtagMap['react'], hashtagMap['javascript']],
        medias: [],
        like: 29,
        bookmark: 15,
        user_views: 740,
        guest_views: 180,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 giờ trước
      },
      {
        user_id: uAlex._id,
        content: 'Chia sẻ concept thiết kế Minimalist Dark Mode mới. Ưu tiên độ tương phản chuẩn WCAG AAA và typography thanh lịch giúp người dùng đọc lâu không bị mỏi mắt.',
        hashtags: [hashtagMap['webdev'], hashtagMap['tech']],
        medias: [
          {
            url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
            type: 'image',
          },
        ],
        like: 62,
        bookmark: 24,
        user_views: 1520,
        guest_views: 630,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 7), // 7 giờ trước
      },
      {
        user_id: uQuoc._id,
        content: 'Clean Architecture trong NodeJS Express: Tách biệt rõ Controllers -> Services -> DatabaseService -> Middlewares giúp debug và mở rộng dự án nhẹ nhàng hơn rất nhiều.',
        hashtags: [hashtagMap['fullstack'], hashtagMap['tech']],
        medias: [],
        like: 41,
        bookmark: 18,
        user_views: 960,
        guest_views: 310,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 giờ trước
      },
      {
        user_id: uSarah._id,
        content: 'Một góc làm việc đầy cảm hứng ngày hôm nay. Chúc mọi người code không bug và hoàn thành tốt sprint tuần này nhé! ☕✨',
        hashtags: [hashtagMap['webdev']],
        medias: [
          {
            url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
            type: 'image',
          },
        ],
        like: 75,
        bookmark: 8,
        user_views: 1840,
        guest_views: 520,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 ngày trước
      },
      {
        user_id: uAlex._id,
        content: 'Microservices hay Monolith? Với 90% dự án khởi đầu, một kiến trúc Modular Monolith được tổ chức tốt luôn mang lại tốc độ phát triển và chi phí vận hành tối ưu nhất.',
        hashtags: [hashtagMap['tech'], hashtagMap['ai']],
        medias: [],
        like: 88,
        bookmark: 31,
        user_views: 2300,
        guest_views: 790,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 ngày trước
      },
      {
        user_id: uSpool._id,
        content: 'Thống kê tuần này: Cộng đồng Spool đã tạo hơn 10,000 bài viết và hơn 50,000 lượt tương tác. Cảm ơn sự đồng hành của tất cả các bạn! 🌟',
        hashtags: [hashtagMap['spool'], hashtagMap['tech']],
        medias: [
          {
            url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
            type: 'image',
          },
        ],
        like: 115,
        bookmark: 42,
        user_views: 3400,
        guest_views: 1100,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 ngày trước
      },
    ];

    const tweetDocs = sampleTweets.map(item => ({
      _id: new ObjectId(),
      user_id: item.user_id,
      type: 'tweet',
      audience: 'everyone',
      content: item.content,
      parent_id: null,
      hashtags: item.hashtags.filter(Boolean),
      mentions: [],
      medias: item.medias,
      like: item.like,
      bookmark: item.bookmark,
      user_views: item.user_views,
      guest_views: item.guest_views,
      created_at: item.created_at,
      updated_at: item.created_at,
    }));

    const result = await tweetsCol.insertMany(tweetDocs);
    console.log(`Đã chèn thành công ${result.insertedCount} bài post mẫu vào database!`);

  } catch (err) {
    console.error('Lỗi khi seed dữ liệu:', err);
  } finally {
    await client.close();
    console.log('Đã đóng kết nối MongoDB.');
  }
}

seed();
