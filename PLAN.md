# 🚀 Kế Hoạch Phát Triển Spool (Twitter / Threads Clone)

> **Tài liệu lưu trữ:** Rà soát và cập nhật tiến độ thực tế toàn bộ hệ thống FullStack Spool.  
> **Cập nhật:** 19/10/2026.

---

## 📊 1. Bảng Tổng Hợp Hiện Trạng Dự Án (Audit Matrix)

| Module / Tính năng | Trạng thái | Đánh giá chi tiết kỹ thuật |
| :--- | :---: | :--- |
| **Auth & Security** | 🟢 95% | Đăng ký, đăng nhập, JWT Access/Refresh Token, Quên mật khẩu & Reset Password qua Email token, Google OAuth, Verify Email. Backend validator chặt chẽ. |
| **Feed & Tweets** | 🟢 95% | Tạo tweet (text, media, hashtags), Infinite scroll feed (React Query + IntersectionObserver), Like, Bookmark, Repost (Retweet/Unretweet), Delete tweet, Slider ảnh đa phương tiện, Skeleton loader, PostBar soạn thảo nhanh. |
| **Bố cục Đa Luồng (Multi-Columns Deck)** | 🟢 95% | Cho phép mở nhiều luồng song song trên màn hình rộng (Home, Following, Liked, Bookmarks, Search, Profile), cuộn ngang mượt mà, lưu cấu hình vào state. |
| **Bình luận / Replies** | 🟢 95% | API lấy danh sách replies con (`/tweets/:id/children`), tạo bình luận lưu trực tiếp vào PostgreSQL qua Prisma, cập nhật số lượng phản hồi tức thì (Optimistic update). |
| **Trang chi tiết Tweet** | 🟢 95% | Route `/tweet/:tweet_id` hiển thị bài viết gốc kích thước lớn, đầy đủ timestamp, số views, replies, likes, reposts; kèm khung trả lời và luồng replies con phân cấp. |
| **Quote Tweet** | 🟢 95% | Modal trích dẫn `CreateThreadModal` nhận `quoteTarget`, card preview `QuoteSpool` trực quan bên trong bài viết, gửi `parent_id` và type `quote`. |
| **Hệ thống Follow** | 🟢 95% | API follow/unfollow backend, optimistic update tăng/giảm followers/following count, `ListFollowModal` xem danh sách người theo dõi / đang theo dõi theo user, nút Follow trực tiếp tại `SearchPage` (tab Profiles) và `ProfilePage`. Feed "Following" (`FollowPage`) hiển thị đúng bài viết từ người được theo dõi. |
| **Hồ sơ Cá nhân (Profile)** | 🟢 95% | `ProfilePage` hiển thị avatar, banner, bio, danh sách bài viết cá nhân, `EditProfileModal` cho phép cập nhật tên, tiểu sử, vị trí, website, ảnh đại diện, ảnh bìa. |
| **Search System** | 🟢 85% | Tìm kiếm bài viết và người dùng theo từ khóa và hashtag, phân loại tabs (Top, Recent, Profiles), debounce tìm kiếm. *Chưa nối bộ lọc thời gian (Trước ngày / Sau ngày).* |
| **Hệ thống Thông báo (Activity)** | 🟢 90% | Đã tạo model `Notification` trong DB, API lấy danh sách, đếm chưa đọc, đánh dấu đã đọc (`/notifications`), Socket realtime báo thông báo tức thì và cập nhật badge trên Navbar, `ActivityPage` phân loại theo tab (Tất cả, Thích, Bình luận, Đăng lại, Follow). |
| **Tin nhắn trực tiếp (Direct Messages)** | 🟢 85% | Bảng `Message` trong DB, API lấy hội thoại (`/user/conversations`) và tin nhắn (`/user/conversations/:id/messages`), Socket.io chat realtime 1-1, giao diện `MessagesPage` 2 cột (sidebar danh sách chat + khung tin nhắn, cuộn tự động, gửi tin nhắn, xoá hội thoại, modal tìm người chat). |
| **Cài đặt (Settings Page)** | 🟢 85% | Giao diện chuẩn phong cách Threads/Spool, đổi mật khẩu thật kết nối backend (`PUT /user/change-password`), toggle Theme Dark/Light, Reset cột bố cục đa luồng, Đăng xuất, các toggle Quyền riêng tư (Private profile, Private likes, Online status). |
| **Hệ thống RSS Bot & Gemini AI** | 🟢 90% | Bảng `BotSetting`, Service cào RSS báo điện tử, dùng Google Gemini AI tóm tắt nội dung tự động tạo hashtags, cron scheduler tự động đăng bài lên feed, trang quản trị `Admin/BotsPage` cấu hình RSS URL, chu kỳ quét, giới hạn bài, bật/tắt bot. |
| **Video & HLS Streaming** | 🟡 70% | Backend có hàng đợi mã hóa video sang HLS bằng FFmpeg, endpoint streaming chunk (`/static/video-stream/:name`) và HLS playlist (`/static/video-hls/:id/master.m3u8`), client có `VideoSpool` phát HLS (`hls.js`). *Còn thiếu giao diện chọn và tải video trực tiếp trên `CreateThreadModal`.* |
| **Hashtags & Trending** | 🟡 50% | Bảng `Hashtag` và `TweetHashtag` lưu trữ hashtag khi đăng bài (kể cả Bot AI) và hỗ trợ tìm kiếm qua search query. *Còn thiếu API Top Trending Hashtags 24h và trang xem bài viết theo hashtag (`/hashtag/:name`).* |
| **Ghost Posts (Bài viết tự huỷ 24h)** | 🔴 10% | Đã có route và giao diện placeholder `GhostPage`. *Chưa có cron job xóa bài sau 24h và tuỳ chọn đánh dấu Ghost post khi đăng bài.* |
| **Lưu trữ (Archive Page)** | 🔴 10% | Đã có route và giao diện placeholder `ArchivePage`. *Chưa có tính năng ẩn/lưu trữ bài viết khỏi trang cá nhân.* |
| **Insights & Thống kê** | 🔴 15% | Đã có giao diện `InsightsPage` hiển thị số liệu tĩnh (views, engagements). *Chưa có API tổng hợp và biểu đồ tương tác thời gian thực.* |
| **Báo cáo sự cố (Report Page)** | 🔴 5% | Route `ReportPage` hiện là placeholder rỗng. |

---

## ✅ 2. CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH (DONE)

### 1. Core Social & Tweet Management
- [x] Đăng bài viết mới (hỗ trợ văn bản, tải nhiều ảnh, gắn hashtag).
- [x] Like / Bỏ like bài viết với Optimistic update và lưu thật vào DB.
- [x] Lưu trữ bài viết (Bookmark / Unbookmark) và trang xem danh sách đã lưu (`SavePage`).
- [x] Xem danh sách bài viết đã like (`LikePage`).
- [x] Đăng lại bài viết (Repost / Retweet) và hủy đăng lại (`unretweet`).
- [x] Xóa bài viết cá nhân (`OptionsSpool` -> gọi `DELETE /tweets/delete-tweet/:tweet_id`).
- [x] Sao chép liên kết bài viết (`Copy link`).
- [x] Trích dẫn bài viết (Quote Tweet) kèm card preview bài gốc.
- [x] Bình luận / Trả lời bài viết (Comments) lưu trực tiếp vào database, tăng count ngay lập tức.
- [x] Trang chi tiết bài viết (`TweetDetailPage` - `/tweet/:tweet_id`) với đầy đủ thread replies.
- [x] Multi-columns deck layout: Mở nhiều cột song song trên màn hình lớn.

### 2. User & Follow System
- [x] Đăng ký, đăng nhập, đăng xuất, Refresh token tự động.
- [x] Quên mật khẩu & Đặt lại mật khẩu qua email token.
- [x] Xác thực email kích hoạt tài khoản.
- [x] Đổi mật khẩu trong Settings (`PUT /user/change-password`).
- [x] Xem trang cá nhân bất kỳ (`ProfilePage` - `/@username`).
- [x] Chỉnh sửa trang cá nhân (`EditProfileModal`: name, bio, location, website, avatar, cover photo).
- [x] Theo dõi / Hủy theo dõi người dùng (Follow / Unfollow) với cập nhật optimistic số lượng followers/following.
- [x] Xem danh sách người theo dõi (`followers`) và đang theo dõi (`following`) qua `ListFollowModal`.
- [x] Nút Follow tương tác thật trên `SearchPage` (tab Profiles) và `ProfilePage`.
- [x] Tab bảng tin người theo dõi (`FollowPage` - `/following`) lọc bài viết của những người mình theo dõi.

### 3. Search & Discovery
- [x] Tìm kiếm theo từ khóa văn bản và hashtag (search debounce 400ms).
- [x] Phân trang kết quả theo 3 tab: Top, Recent, Profiles.
- [x] Đồng bộ query và tab lên URL search params (`?q=...&tab=...`).

### 4. Real-time Notifications & Activity
- [x] Bảng `Notification` trong Prisma Schema liên kết Sender, Receiver, Tweet.
- [x] API lấy thông báo, đánh dấu đã đọc 1 thông báo, đánh dấu đã đọc tất cả, đếm số chưa đọc.
- [x] Socket realtime đẩy thông báo khi có tương tác mới.
- [x] Badge số thông báo chưa đọc hiển thị trực tiếp trên thanh Navbar.
- [x] Trang `ActivityPage` hoàn chỉnh với các bộ lọc: Tất cả, Lượt thích, Bình luận & Trích dẫn, Đăng lại, Theo dõi.

### 5. Direct Messages (Tin Nhắn Trực Tiếp)
- [x] Bảng `Message` trong database liên kết sender và receiver.
- [x] API lấy danh sách cuộc hội thoại gần nhất (`GET /user/conversations`).
- [x] API lấy lịch sử tin nhắn của một cuộc trò chuyện (`GET /user/conversations/:id/messages`).
- [x] Xoá cuộc hội thoại (`DELETE /user/conversations/:id`).
- [x] Kết nối Socket.io trao đổi tin nhắn 1-1 thời gian thực, tự động cuộn xuống cuối.
- [x] Giao diện `MessagesPage` 2 cột (Sidebar danh sách + Khung chat), optimistic update khi bấm gửi.
- [x] Modal tìm kiếm người dùng mới để bắt đầu chat (`NewMessageModal`).
- [x] Nút "Message" từ trang cá nhân `ProfilePage` chuyển thẳng vào phòng chat với user đó.

### 6. RSS Bot & AI Auto Posting
- [x] Bảng `BotSetting` lưu trữ nguồn RSS và cấu hình chu kỳ chạy của bot.
- [x] Tự động đọc RSS tin tức, tích hợp Google Gemini AI tạo bài viết súc tích và đề xuất 2-4 hashtags phù hợp.
- [x] Node-cron scheduler tự động đăng bài lên hệ thống theo chu kỳ định sẵn.
- [x] Trang quản trị `Admin/BotsPage` hiển thị danh sách bot, cấu hình URL RSS, thời gian lặp (phút), số bài đăng mỗi đợt, bật/tắt bot.

### 7. Settings Page
- [x] Cấu trúc giao diện 2 cột chuẩn thiết kế (Nav bên trái + Panel chi tiết bên phải).
- [x] Accounts Center: Form đổi mật khẩu thực tế kết nối API.
- [x] Privacy: Toggle chuyển đổi chế độ tài khoản Riêng tư / Công khai, ẩn/hiện danh sách like, bật/tắt trạng thái online.
- [x] Appearance: Toggle chuyển đổi giao diện Sáng / Tối (Dark/Light Mode).
- [x] Quản lý bố cục: Nút Reset các cột đa luồng về mặc định.
- [x] Đăng xuất an toàn.

---

## 🔄 3. CÁC TÍNH NĂNG CẦN HOÀN THIỆN TIẾP (IN PROGRESS / BACKLOG)

Dưới đây là các hạng mục kỹ thuật cần tiếp tục triển khai theo thứ tự ưu tiên:

---

### 🎯 GIAI ĐOẠN 2: HOÀN THIỆN MEDIA & TÌM KIẾM NÂNG CAO

#### 1. Nối Tải Lên Video Vào Client (`CreateThreadModal`)
- [ ] Bổ sung nút chọn video (mp4, mov) cạnh nút upload ảnh trong `CreateThreadModal`.
- [ ] Thêm thanh tiến trình tải lên (upload progress bar).
- [ ] Gọi API `mediasApi.uploadVideo` hoặc `mediasApi.uploadVideoHls` khi tạo bài viết.
- [ ] Hiển thị preview video trước khi đăng và phát qua `VideoSpool` (`hls.js`).

#### 2. Bộ Lọc Thời Gian Trong Tìm Kiếm (`SearchPage`)
- [ ] Gắn sự kiện chọn ngày cho popup "Trước ngày" (`before_date`) và "Sau ngày` (`after_date`).
- [ ] Backend `searchs.service.ts`: Bổ sung điều kiện lọc `created_at: { gte: afterDate, lte: beforeDate }`.

---

### 🎯 GIAI ĐOẠN 3: HASHTAGS & DISCOVERY

#### 1. Trending Hashtags
- [ ] Backend API `GET /search/trending-hashtags`: Thống kê các hashtag được dùng nhiều nhất trong 24 giờ qua.
- [ ] Hiển thị danh sách hashtag nổi bật tại sidebar / trang Search.
- [ ] Tạo trang xem bài viết theo hashtag riêng biệt (`/hashtag/:name`).
- [ ] Khi click vào `#hashtag` trong nội dung bài viết, tự động điều hướng sang trang hashtag tương ứng.

---

### 🎯 GIAI ĐOẠN 4: ADVANCED FEATURES (NÂNG CAO)

#### 1. Ghost Posts (Bài Viết Tự Hủy Sau 24h)
- [ ] Thêm cờ `is_ghost: Boolean` hoặc trường `expires_at: DateTime?` trong model `Tweet`.
- [ ] Client: Thêm checkbox "Ghost Post (tự xóa sau 24h)" trong modal tạo bài viết.
- [ ] Backend: Cron job quét các bài viết ghost đã quá 24h và tự động xóa.
- [ ] Trang `GhostPage`: Hiển thị danh sách các bài viết ghost đang hoạt động kèm đồng hồ đếm ngược thời gian còn lại.

#### 2. Lưu Trữ Bài Viết (Archive Posts)
- [ ] Thêm trường `is_archived: Boolean @default(false)` vào model `Tweet`.
- [ ] Thêm tuỳ chọn "Archive spool" trong menu `OptionsSpool`.
- [ ] Ẩn các bài viết đã archive khỏi trang chủ và profile công khai.
- [ ] Trang `ArchivePage`: Hiển thị danh sách bài viết đã lưu trữ và cho phép khôi phục (Unarchive).

#### 3. Thống Kê & Phân Tích (Insights)
- [ ] Backend: Thống kê tổng số lượt views (`user_views`, `guest_views`), lượt thích, bình luận của user trong 7 ngày gần nhất.
- [ ] Trang `InsightsPage`: Thay thế dữ liệu mock bằng API thật, vẽ biểu đồ trực quan xu hướng tương tác.

#### 4. Báo Cáo Sự Cố (Report Page)
- [ ] Xây dựng form gửi phản hồi/báo cáo lỗi tại `ReportPage` (chọn loại sự cố, nhập nội dung, đính kèm ảnh chụp màn hình).
- [ ] Lưu phản hồi vào cơ sở dữ liệu để quản trị viên theo dõi.

---

## 📝 4. CHECKLIST KIỂM THỬ THỰC TẾ (TESTING CHECKLIST)

- [x] Tạo bài viết mới kèm ảnh -> Hiển thị trên feed ngay lập tức.
- [x] Like / Bỏ like -> F5 trang số lượng like và trạng thái tim vẫn được duy trì chính xác.
- [x] Bookmark bài viết -> Xem lại trong trang `SavePage` (/save).
- [x] Tạo bình luận -> F5 trang số `replies_count` tăng chính xác và hiển thị trong chi tiết bài viết.
- [x] Bấm vào một bài viết bất kỳ trên Feed -> Chuyển hướng đúng đến `/tweet/:tweet_id`.
- [x] Quote tweet -> Hiển thị đầy đủ lời trích dẫn của user và card bài viết gốc (`QuoteSpool`).
- [x] Follow người khác trên Profile -> Số `following_count` và `followers_count` cập nhật đúng.
- [x] Bấm vào số followers/following -> Modal `ListFollowModal` hiển thị danh sách người dùng chính xác.
- [x] Gắn sự kiện Follow trên Search Page tab Profiles -> Bấm Follow đổi trạng thái và gửi API thành công.
- [x] Feed "Following" (`FollowPage`) hiển thị đúng bài viết của những người mình theo dõi.
- [x] Nhắn tin realtime 1-1 qua Socket.io -> Hai tài khoản nhắn tin nhận phản hồi tức thì mà không cần reload.
- [x] Đổi mật khẩu trong Settings -> Đăng nhập lại bằng mật khẩu mới thành công.
- [x] Cấu hình và chạy Bot RSS AI -> Tự động tóm tắt tin tức và đăng bài có hashtag lên feed.
- [ ] Chọn upload video trực tiếp khi tạo bài viết từ trình duyệt.
- [ ] Bấm vào thẻ `#hashtag` mở trang tổng hợp các bài viết cùng hashtag.
- [ ] Đăng bài viết Ghost và kiểm tra tính năng tự xóa sau thời gian hết hạn.
