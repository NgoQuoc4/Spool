client/src/
├── assets/ # Ảnh tĩnh, logo, fonts
├── apis/ # Tầng giao tiếp với Backend API
│ ├── http.ts # Axios/Fetch instance, cấu hình baseURL, interceptors (gắn token, refresh token)
│ ├── auth.api.ts # login, register, logout, verify-email, oauth
│ ├── tweets.api.ts # getFeeds, getTweetDetail, createTweet, getTweetChildren
│ ├── users.api.ts # getProfile, updateProfile, follow, unfollow
│ ├── medias.api.ts # uploadImage, uploadVideo, getHLSStatus
│ └── interactions.api.ts # like, unlike, bookmark, unbookmark
│
├── components/ # Các component dùng chung toàn app
│ ├── common/ # UI cơ bản (Button, Input, Modal, Dropdown, Avatar, Toast)
│ ├── icons/ # Tách các SVG icon nhỏ gọn thay vì gom 1 file 15KB
│ └── feedback/ # Skeleton loading, EmptyState, ErrorBoundary
│
├── layouts/ # Khung sườn giao diện
│ ├── MainLayout.tsx # Layout chính: [Navbar (trái) | Content (giữa) | RightSidebar (phải)]
│ └── AuthLayout.tsx # Layout cho Login / Register / Forgot Password
│
├── pages/ # Từng màn hình ứng dụng (Routing pages)
│ ├── Home/ # Trang Newsfeed
│ │ ├── components/ # Component chỉ dùng riêng cho Home (QuickComposer, FeedTabs...)
│ │ └── index.tsx
│ ├── TweetDetail/ # Chi tiết Tweet & Replies
│ ├── Profile/ # Trang cá nhân user
│ ├── Login/
│ ├── Register/
│ └── NotFound/
│
├── hooks/ # Custom hooks tái sử dụng
│ ├── useAuth.ts # Lấy thông tin user hiện tại, check trạng thái login
│ ├── useDebounce.ts # Dùng cho ô tìm kiếm search user/tweet
│ └── useInfiniteScroll.ts # Tải thêm tweet khi cuộn trang
│
├── contexts/ # Global state với React Context
│ ├── AuthContext.tsx # Quản lý accessToken, profile user, logout
│ └── ThemeContext.tsx # Quản lý dark/light mode
│
├── types/ # TypeScript definitions (khớp với server models)
│ ├── auth.types.ts
│ ├── tweet.types.ts # Tweet, TweetType, TweetAudience
│ ├── user.types.ts # User, UserVerifyStatus
│ └── media.types.ts # Media, MediaType
│
├── constants/ # Hằng số, config, enums
│ ├── path.ts # Định nghĩa URL routes: PATH.HOME, PATH.LOGIN...
│ └── endpoints.ts # Định nghĩa API endpoints: /tweets, /users/login...
│
├── utils/ # Helper functions thuần túy
│ ├── auth.ts # Lưu/lấy token từ localStorage/cookies
│ ├── format.ts # Format ngày giờ (relative time "2h ago"), format số like
│ └── video.ts # Khởi tạo hls.js player
│
├── routes/ # Cấu hình routing
│ ├── ProtectedRoute.tsx # Chặn truy cập nếu chưa login
│ ├── RejectedRoute.tsx # Chặn vào login/register nếu đã đăng nhập
│ └── index.tsx # Khởi tạo createBrowserRouter
│
├── App.tsx # Bọc Providers (AuthProvider, ThemeProvider, ToastProvider)
├── main.tsx
└── index.css # Global styles & Design tokens (CSS Variables)
