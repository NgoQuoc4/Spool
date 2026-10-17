import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { notifications } from "@/apis/notifications.api";
import {
  CommentIcon,
  HeartIcon,
  RepostIcon,
  UserIcon,
} from "@/components/Icons";
import TopBar from "@/components/TopBar";
import { useFormatRelativeTime } from "@/hooks/useFormatRelativeTime";
import { Skeleton } from "@/components/Skeleton";
import SpoolsFound from "@/components/SpoolCard/SpoolsFound";
import "./ActivityPage.css";

type ActivityTab = "all" | "like" | "comment" | "repost" | "follow";

interface NotificationItem {
  id: string;
  _id?: string;
  senderId: string;
  receiverId: string;
  type: "like" | "comment" | "repost" | "quote" | "follow" | "mention";
  tweetId?: string;
  content?: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
  tweet?: {
    id: string;
    content?: string;
  };
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";

const TABS: { key: ActivityTab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "like", label: "Lượt thích" },
  { key: "comment", label: "Bình luận" },
  { key: "repost", label: "Đăng lại" },
  { key: "follow", label: "Theo dõi" },
];

const ActivityPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notifications.getNotifications(),
    refetchOnWindowFocus: false,
  });

  const rawNotifications: NotificationItem[] =
    data?.data?.data || (Array.isArray(data?.data) ? data.data : []);

  // Đánh dấu đã đọc
  const readMutation = useMutation({
    mutationFn: (id: string) => notifications.readNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unread-notifications-count"],
      });
    },
  });

  const handleNavigateToNotification = (item: NotificationItem) => {
    const notifId = item.id || item._id;
    if (notifId && !item.isRead) {
      readMutation.mutate(notifId);
    }

    if (item.tweetId) {
      navigate(`/tweets/${item.tweetId}`);
    } else if (item.sender?.username) {
      navigate(`/@${item.sender.username}`);
    }
  };

  // Lọc theo tab
  const filteredNotifications = rawNotifications.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "comment") {
      return item.type === "comment" || item.type === "quote";
    }
    return item.type === activeTab;
  });

  const renderBadge = (type: NotificationItem["type"]) => {
    switch (type) {
      case "like":
        return (
          <div className="activity-badge like" title="Thích">
            <HeartIcon size={12} active={true} color="#ffffff" />
          </div>
        );
      case "comment":
      case "quote":
        return (
          <div className="activity-badge comment" title="Bình luận">
            <CommentIcon size={12} color="#ffffff" />
          </div>
        );
      case "repost":
        return (
          <div className="activity-badge repost" title="Đăng lại">
            <RepostIcon size={12} active={true} color="#ffffff" />
          </div>
        );
      case "follow":
        return (
          <div className="activity-badge follow" title="Theo dõi">
            <UserIcon size={12} active={true} color="#ffffff" />
          </div>
        );
      default:
        return (
          <div className="activity-badge comment">
            <CommentIcon size={12} color="#ffffff" />
          </div>
        );
    }
  };

  const renderActionText = (item: NotificationItem) => {
    switch (item.type) {
      case "like":
        return "đã thích bài viết của bạn";
      case "repost":
        return "đã đăng lại bài viết của bạn";
      case "comment":
        return "đã bình luận về bài viết của bạn:";
      case "quote":
        return "đã trích dẫn bài viết của bạn:";
      case "follow":
        return "đã bắt đầu theo dõi bạn";
      case "mention":
        return "đã nhắc đến bạn trong một bài viết";
      default:
        return "đã tương tác với bạn";
    }
  };

  return (
    <div className="feed-column">
      <TopBar type="activity" />
      <section className="feed-section">
        <div className="activity-container">
          <div className="activity-header">
            <h1 className="activity-title">Hoạt động</h1>

            {/* Filter Tabs */}
            <div className="activity-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`activity-tab-btn ${
                    activeTab === tab.key ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List or Loading / Empty States */}
          {isLoading ? (
            <div className="activity-list">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className="activity-item"
                  style={{ pointerEvents: "none" }}
                >
                  <Skeleton width="44px" height="44px" circle />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <Skeleton width="180px" height="15px" borderRadius="4px" />
                    <Skeleton width="260px" height="13px" borderRadius="4px" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-secondary)",
              }}
            >
              <p>Không thể tải thông báo. Vui lòng thử lại sau!</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <SpoolsFound
              title="Chưa có hoạt động nào"
              content={
                activeTab === "all"
                  ? "Khi ai đó thích, trả lời hoặc theo dõi bạn, thông báo sẽ xuất hiện tại đây."
                  : `Không có thông báo nào trong mục "${
                      TABS.find((t) => t.key === activeTab)?.label
                    }".`
              }
            />
          ) : (
            <div className="activity-list">
              {filteredNotifications.map((item) => {
                const notifId = item.id || item._id;
                const senderName =
                  item.sender?.name ||
                  item.sender?.username ||
                  "Người dùng Spool";
                const username = item.sender?.username || "user";
                const avatar = item.sender?.avatar || DEFAULT_AVATAR;

                return (
                  <article
                    key={notifId}
                    className={`activity-item ${!item.isRead ? "unread" : ""}`}
                    onClick={() => handleNavigateToNotification(item)}
                  >
                    {/* Avatar & Floating Badge */}
                    <div
                      className="activity-avatar-wrapper"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/@${username}`);
                      }}
                      title={`Xem trang cá nhân của @${username}`}
                    >
                      <img
                        src={avatar}
                        alt={senderName}
                        className="activity-avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                        }}
                      />
                      {renderBadge(item.type)}
                    </div>

                    {/* Content */}
                    <div className="activity-content">
                      <div className="activity-meta">
                        <Link
                          to={`/@${username}`}
                          className="activity-username"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {senderName}
                        </Link>
                        <span className="activity-handle">@{username}</span>
                        <span className="activity-dot">·</span>
                        <span className="activity-time">
                          {useFormatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <div className="activity-action">
                        <span className="activity-action-label">
                          {renderActionText(item)}
                        </span>
                      </div>

                      {/* Comment content snippet or Tweet preview */}
                      {item.content ? (
                        <div className="activity-snippet">"{item.content}"</div>
                      ) : item.tweet?.content ? (
                        <div
                          className="activity-snippet"
                          style={{
                            color: "var(--text-secondary)",
                            fontStyle: "italic",
                          }}
                        >
                          "{item.tweet.content}"
                        </div>
                      ) : null}
                    </div>

                    {/* Right side indicators */}
                    <div className="activity-right">
                      {!item.isRead && (
                        <span
                          className="activity-unread-dot"
                          title="Chưa đọc"
                        />
                      )}
                      {item.type === "follow" && (
                        <button
                          type="button"
                          className="activity-follow-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/@${username}`);
                          }}
                        >
                          Xem hồ sơ
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActivityPage;
