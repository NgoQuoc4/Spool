# 🚀 Kế Hoạch Phát Triển Spool (Twitter Clone)

> **Tài liệu lưu trữ:** Kế hoạch thực hiện từng bước cho dự án FullStack Spool / Twitter.  
> **Cập nhật:** 12/10/2026.

---

## 📊 1. Tổng Quan Hiện Trạng Dự Án

| Tính năng                | Trạng thái | Chi tiết kỹ thuật                                                                                                                                                                                                       |
| :----------------------- | :--------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth & Security**      |   🟢 95%   | Đăng ký, đăng nhập, JWT Refresh Token, Quên mật khẩu & Reset Password qua Email/Token, Google OAuth, trang Verify Email/Password.                                                                                       |
| **Feed & Tweets**        |   🟢 90%   | Tạo tweet, Infinite scroll feeds, Like, Bookmark, Repost. Slider multi-images. Skeleton loader & PostBar tối ưu.                                                                                                        |
| **Search System**        |   🟢 85%   | API search tweets & users, phân trang, giao diện đầy đủ các tabs (Top, Recent, People, Media).                                                                                                                          |
| **Quote Tweet**          |   🟢 85%   | Modal trích dẫn `CreateThreadModal` tích hợp `quoteTarget`, card hiển thị `QuoteSpool` trực quan, gửi `parent_id` & type `QUOTETWEET`.                                                                                  |
| **Follow System**        |   🟡 70%   | API follow/unfollow backend, nút Follow/Unfollow tương tác thật & Optimistic update trên `ProfilePage`, `FollowModal`. Còn thiếu: API danh sách `followers`/`following` theo user, gắn sự kiện nút Follow ở SearchPage. |
| **Edit Profile**         |   🟢 90%   | `EditProfileModal` cho phép cập nhật tên, bio, location, website, avatar, cover photo.                                                                                                                                  |
| **Bình luận / Replies**  |   🟢 95%   | API lấy danh sách replies con (`/tweets/:id/children`), gửi bình luận lưu thật DB, optimistic updates.                                                                                                                   |
| **Trang chi tiết Tweet** |   🟢 95%   | Route `/tweet/:tweet_id` xem toàn bộ luồng bài viết, khung nhập bình luận & danh sách replies.                                                                                                                           |
| **Settings Page**        |   🔴 0%    | `SettingPage/index.tsx` đang là placeholder rỗng.                                                                                                                                                                       |
| **Video HLS Encode**     |   🟡 60%   | Đang viết queue ở `medias.service.ts`, chưa tích hợp vào luồng tạo post ở client.                                                                                                                                       |
| **Notifications**        |   🔴 10%   | `ActivityPage` đang dùng dữ liệu giả lập (mock). DB chưa có bảng Notification.                                                                                                                                          |
| **Direct Messages**      |   🔴 5%    | `MessagesPage` là trang tĩnh.                                                                                                                                                                                           |

---

## 🎯 2. KẾ HOẠCH BẮT ĐẦU (GIAI ĐOẠN 1: CORE SOCIAL)

Tập trung hoàn thiện: **Quote tweet (đã xong), Follow system (đang hoàn thiện), Bình luận thật & Xem chi tiết bài viết (ưu tiên kế tiếp)**.

---

### 🔹 Bước 1: API Lấy Bình Luận Con (Tweet Children / Replies)

- **Mục tiêu:** Cho phép client lấy danh sách các tweet con (bình luận) của một bài viết cụ thể.
- [x] **Backend (`server/src/services/tweets.service.ts`)**:
  - Viết method `getTweetChildren(tweet_id, limit, page, currentUserId)`:
    - Query `prisma.tweet.findMany` với điều kiện `{ parent_id: tweet_id, type: 'comment' }`.
    - Hỗ trợ phân trang: `skip = (page - 1) * limit`, `take = limit`, `orderBy: { created_at: 'asc' }`.
    - Kèm `include: tweetInclude(currentUserId)` để lấy tác giả, media, trạng thái like.
- [x] **Backend (`server/src/controllers/tweets.controller.ts`)**:
  - Tạo controller `getTweetChildrenController`.
- [x] **Backend (`server/src/routers/tweets.router.ts`)**:
  - Đăng ký route: `GET /tweets/:tweet_id/children` (kèm `accessTokenValidator`).
- [x] **Client (`client/src/apis/tweets.api.ts`)**:
  - Thêm hàm `getTweetChildren(tweet_id, params: { page?: number; limit?: number })`.

---

### 🔹 Bước 2: Nối Bình Luận Trên Client Vào Database

- **Mục tiêu:** Khi người dùng nhập comment ở `ThreadCard` hoặc `TweetDetail`, dữ liệu được lưu thật vào Database.
- [x] **Client (`client/src/hooks/useTweetActions.ts`)**:
  - Cập nhật hàm `handleReplyAdded`:
    - Gọi API `tweetsApi.createTweet({ parent_id: postId, type: TweetType.COMMENT, content: text, audience: TweetAudienceType.EVERYONE, hashtags: [], mentions: [], medias: [] })`.
    - Tăng `repliesCount` trên UI ngay lập tức (Optimistic Update).
    - Hiển thị Toast thông báo thành công hoặc rollback nếu lỗi mạng.
- [x] **Client (`client/src/components/ThreadCard.tsx`)**:
  - Cho phép click icon Comment hoặc nội dung bài viết để điều hướng tới trang chi tiết.

---

### 🔹 Bước 3: Xây Dựng Trang Chi Tiết Bài Viết (Tweet Detail Page)

- **Mục tiêu:** Bấm vào bài viết sẽ mở trang chi tiết hiển thị toàn bộ nội dung, ngày giờ, view và danh sách thảo luận.
- [x] **Client (`client/src/constants/path.ts`)**:
  - Bổ sung `TWEET_DETAIL: "/tweet/:tweet_id"`.
- [x] **Client (`client/src/routes/index.tsx`)**:
  - Thêm route con trong `ProtectedRoute`: `{ path: PATH.TWEET_DETAIL, element: <TweetDetailPage /> }`.
- [x] **Client (`client/src/pages/TweetDetailPage/index.tsx`)**:
  - Dùng `useParams<{ tweet_id: string }>()`.
  - Gọi `useQuery` lấy thông tin bài viết gốc (`tweetsApi.getTweet(tweet_id)`).
  - Gọi `useQuery` lấy danh sách bình luận con (`tweetsApi.getTweetChildren(tweet_id)`).
  - Render Card bài viết chính cỡ lớn (full timestamp, số views, replies, likes, reposts).
  - Khung soạn thảo bình luận cố định ở trên danh sách replies.
  - Danh sách các replies hiển thị theo luồng dọc.

---

### 🔹 Bước 4: Hoàn Thiện Tính Năng Quote Tweet

- **Mục tiêu:** Cho phép người dùng viết bài kèm trích dẫn bài viết của người khác.
- [x] **Client (`client/src/components/SpoolCard/ActionSpool.tsx`)**:
  - Bấm nút "Quote" gọi `openQuoteModal(post)`.
- [x] **Client (`client/src/components/CreateThreadModal.tsx`)**:
  - Nhận prop `quoteTarget`, hiển thị thông tin bài trích dẫn.
  - Khi submit, gửi `type: TweetType.QUOTETWEET`, `parent_id: quoteTarget.id`.
- [x] **Client (`client/src/components/SpoolCard/QuoteSpool.tsx`)**:
  - Hiển thị preview trích dẫn bên trong bài viết (Avatar, tên, username, nội dung, ảnh thumbnail).

---

### 🔹 Bước 5: Hoàn Thiện Hệ Thống Follow / Unfollow Tương Tác Thật

- **Mục tiêu:** Follow/Unfollow hoạt động đồng bộ trên toàn ứng dụng.
- [x] **Client (`client/src/pages/ProfilePage/index.tsx`)**:
  - Nút Follow/Unfollow hoạt động với Optimistic update, tăng/giảm `followers_count`.
- [x] **Client (`client/src/components/FollowModal.tsx`)**:
  - Modal xác nhận / thao tác Follow user trực tiếp.
- [ ] **Client (`client/src/pages/SearchPage/index.tsx`)**:
  - Bắt sự kiện `onClick` cho nút Follow ở tab "Profiles" để follow trực tiếp kết quả tìm kiếm.
- [ ] **Backend (`server/src/routers/user.router.ts`) & Controller**:
  - Thêm `GET /user/:username/followers`: Trả về danh sách user theo dõi `username`.
  - Thêm `GET /user/:username/following`: Trả về danh sách user mà `username` đang theo dõi.

---

## 📅 3. CÁC GIAI ĐOẠN TIẾP THEO

### 🛠️ Giai Đoạn 2: Settings & Hoàn Thiện Media HLS

1. **Trang Cài Đặt (`SettingPage/index.tsx`)**:
   - Tab Tài khoản (Username, Email).
   - Form Đổi mật khẩu (gọi `usersApi.changePassword`).
   - Theme toggle (Dark / Light) & Đăng xuất an toàn.
2. **Video & HLS Encoding**:
   - Hoàn thiện queue `processEncode` trong `medias.service.ts`.
   - Viết API `GET /medias/video-status/:name`.
   - Tích hợp upload video trong `CreateThreadModal` và phát qua `hls.js`.

### 🔔 Giai Đoạn 3: Notifications & Hashtags

1. **Hệ thống Thông báo (Activity)**:
   - Tạo model `Notification` trong `prisma/schema.prisma`.
   - Tạo thông báo tự động khi có Like, Repost, Comment, Follow.
   - Hiển thị danh sách thông báo thật trong `ActivityPage`.
2. **Trending Hashtags**:
   - API lấy top Hashtag hot trong 24h.
   - Trang xem bài viết theo hashtag (`/hashtag/:name`).

### 💬 Giai Đoạn 4: Advanced Features

1. **Tin nhắn trực tiếp (Direct Messages)**:
   - WebSocket (Socket.io) cho phòng chat 1:1.
   - Bảng `Message` & `Conversation` trong Prisma.
2. **Ghost Posts**:
   - Cron job tự động xóa bài sau 24h (`node-cron`).
3. **Insights & Phân tích**:
   - Biểu đồ tăng trưởng view và tương tác trên `InsightsPage`.

---

## 📝 4. CHECKLIST KIỂM TRA CHẤT LƯỢNG (TESTING CHECKLIST)

- [ ] Tạo bình luận -> F5 trang dữ liệu vẫn còn và số `replies_count` tăng chính xác.
- [ ] Bấm vào một bài viết bất kỳ trên Feed chuyển hướng đúng đến `/tweet/:tweet_id`.
- [x] Quote tweet hiển thị đầy đủ cả lời bình của user và thẻ bài viết gốc (`QuoteSpool`).
- [x] Follow người khác trên Profile -> Số `following_count` và `followers_count` cập nhật đúng (Optimistic update).
- [ ] Gắn sự kiện Follow trên Search Page tab Profiles.
- [ ] Feed "Following" (`FollowPage`) hiển thị đúng bài của những người vừa follow.
