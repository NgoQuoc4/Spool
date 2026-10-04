import type { ThreadPost, Author } from "@/types";

export const CURRENT_USER: Author = {
  id: "current-user",
  name: "Ngọc Hải",
  username: "ngochai.dev",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  verified: true,
  bio: "Fullstack Engineer & Creative Technologist 🚀 Building cool stuff with React, Node.js & Vite.",
  followers: "4.8K",
  isFollowing: true,
};

export const INITIAL_SUGGESTIONS: Author[] = [
  {
    id: "sug-1",
    name: "Mark Zuckerberg",
    username: "zuck",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    verified: true,
    bio: "Building Meta, AI, Quest and open source models.",
    followers: "5.2M",
    isFollowing: false,
  },
  {
    id: "sug-2",
    name: "Spool Official",
    username: "spool",
    avatar: "/spool_vector.svg",
    verified: true,
    bio: "Welcome to Spool — open conversations, community and media.",
    followers: "14.2M",
    isFollowing: true,
  },
  {
    id: "sug-3",
    name: "React",
    username: "reactjs",
    avatar:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=200&q=80",
    verified: true,
    bio: "The library for web and native user interfaces.",
    followers: "890K",
    isFollowing: false,
  },
  {
    id: "sug-4",
    name: "National Geographic",
    username: "natgeo",
    avatar:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=200&q=80",
    verified: true,
    bio: "Inspiring people to care about the planet since 1888 🌍",
    followers: "28.1M",
    isFollowing: false,
  },
];

export const INITIAL_THREADS: ThreadPost[] = [
  {
    id: "thread-all-media",
    author: {
      id: "ngochai-dev",
      name: "Ngọc Hải",
      username: "ngochai.dev",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      verified: true,
    },
    content:
      "🚀 Demo trọn bộ đa phương tiện: Bài viết này bao gồm đầy đủ Hình ảnh (Image), Video MP4, Video HLS và Tệp tài liệu đính kèm (File Attachment)!",
    createdAt: "Vừa xong",
    medias: [
      {
        type: "image",
        urls: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=800&q=80",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80",
        ],
      },
      {
        type: "video",
        urls: [
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        ],
      },
      {
        type: "hls",
        urls: [
          "http://localhost:4000/static/video-hls/01a101bc-f1f6-76f6-b738-4611a2e518b1/master.m3u8",
        ],
      },
      {
        type: "file",
        name: "Fullstack_Twitter_Project_Architecture.pdf",
        size: "3.8 MB",
        urls: [
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        ],
      },
    ],
    likes: 128,
    repliesCount: 16,
    repostsCount: 32,
    isLiked: false,
  },
  {
    id: "thread-stfu",
    author: {
      id: "stfu-basha",
      name: "stfu.basha",
      username: "stfu.basha",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      verified: false,
    },
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.",
    createdAt: "41m",
    media: {
      type: "image",
      urls: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&h=800&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80",
      ],
    },
    likes: 14,
    repliesCount: 0,
    repostsCount: 0,
    isLiked: false,
  },
  {
    id: "thread-vbaby",
    author: {
      id: "vbaby315",
      name: "vbaby315",
      username: "vbaby315",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      verified: false,
    },
    content: "I need help figuring out my halloween costume this year 🎃",
    createdAt: "09/04/26",
    likes: 10,
    repliesCount: 7,
    repostsCount: 0,
    isLiked: false,
    replies: [
      {
        id: "rep-grape",
        author: {
          id: "grapepham-official",
          name: "grapepham.official",
          username: "grapepham.official",
          avatar:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
        },
        topic: "viral",
        createdAt: "1d",
        content:
          "I think I can help you with that <3\n\nWeb: grapepham.com\nShopee: s.shopee.vn/30qjb...",
        likes: 5,
        media: {
          type: "image",
          urls: [
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=800&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80",
            "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&h=800&q=80",
          ],
        },
      },
    ],
  },
  {
    id: "thread-0",
    author: {
      id: "kinh-iia",
      name: "Kính",
      username: "_kinh.iia_",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      verified: false,
    },
    content: "dii nhụ khonggggg",
    createdAt: "3h left",
    likes: 12,
    repliesCount: 4,
    repostsCount: 1,
    isLiked: false,
    replies: [
      {
        id: "rep-1",
        author: {
          id: "tranquang425",
          name: "Trần Quang",
          username: "tranquang425",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
        },
        content: "Đi đâu cơ Translate",
        createdAt: "17h",
        likes: 1,
      },
      {
        id: "rep-2",
        author: {
          id: "kinh-iia",
          name: "Kính",
          username: "_kinh.iia_",
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
        },
        content: "di nhâuuu",
        createdAt: "17h",
        likes: 0,
      },
      {
        id: "rep-3",
        author: {
          id: "2212002quy",
          name: "Quý",
          username: "2212002quy",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
        },
        content: "Đii Translate",
        createdAt: "20h",
        likes: 1,
      },
      {
        id: "rep-4",
        author: {
          id: "tonyseetinh",
          name: "Tony",
          username: "tonyseetinh",
          avatar:
            "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80",
        },
        content: "là gì z Translate",
        createdAt: "20h",
        likes: 0,
      },
    ],
  },
  {
    id: "thread-1",
    author: {
      id: "zuck",
      name: "Mark Zuckerberg",
      username: "zuck",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      verified: true,
    },
    content:
      "Welcome to Spool! We have rolled out column feeds, fast replies, and seamless media sharing. What feature do you want us to ship next? 👇",
    createdAt: "2h",
    poll: {
      options: [
        { id: "opt-1", text: "Multiple feeds / TweetDeck mode", votes: 1420 },
        { id: "opt-2", text: "Direct messaging (DMs)", votes: 2310 },
        { id: "opt-3", text: "Topic search & live trends", votes: 980 },
        { id: "opt-4", text: "Chronological timeline lock", votes: 1840 },
      ],
      totalVotes: 6550,
      userVotedIndex: 1,
    },
    likes: 3842,
    repliesCount: 428,
    repostsCount: 512,
    isLiked: true,
    replyAvatars: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80",
    ],
    replies: [
      {
        id: "reply-1",
        author: {
          id: "spool-team",
          name: "Spool Team",
          username: "spool",
          avatar: "/spool_vector.svg",
          verified: true,
        },
        content:
          "We are reading every reply! Multi-column layout and advanced filtering are already rolling out worldwide 🚀",
        createdAt: "1h",
        likes: 924,
        isLiked: false,
      },
    ],
  },
  {
    id: "thread-2",
    author: {
      id: "ngochai-dev",
      name: "Ngọc Hải",
      username: "ngochai.dev",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      verified: true,
    },
    content:
      "Just deployed our full-stack video streaming pipeline with HLS protocol on port 4000! 🎥 Smooth adaptive bitrate streaming, ultra-low latency, and modern UI. Check this demo video stream below: #streaming #hls #fullstack #vite",
    createdAt: "3h",
    media: {
      type: "hls",
      urls: [
        "http://localhost:4000/static/video-hls/01a101bc-f1f6-76f6-b738-4611a2e518b1/master.m3u8",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      ],
      aspectRatio: "16/9",
    },
    likes: 852,
    repliesCount: 64,
    repostsCount: 119,
    isLiked: false,
    replyAvatars: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    ],
  },
  {
    id: "thread-3",
    author: {
      id: "natgeo",
      name: "National Geographic",
      username: "natgeo",
      avatar:
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=200&q=80",
      verified: true,
    },
    content:
      "Golden hour deep in the misty peaks of Dolomites, Northern Italy. Nature paints in tones no algorithm can replicate 🏔️✨ What is your favourite place you visited this year?",
    createdAt: "6h",
    media: {
      type: "image",
      urls: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
      ],
    },

    likes: 12430,
    repliesCount: 842,
    repostsCount: 1980,
    isLiked: false,
    replyAvatars: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80",
    ],
  },
  {
    id: "thread-4",
    author: {
      id: "design-daily",
      name: "Design Digest",
      username: "designdigest",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      verified: false,
    },
    content:
      "The beauty of minimalist UX is in what you omit, not what you add. Deep pure blacks, generous spacing, subtle hover states, and buttery micro-animations are the hallmark of 2026 aesthetics.",
    createdAt: "8h",
    likes: 2190,
    repliesCount: 95,
    repostsCount: 310,
    isLiked: true,
  },
];
