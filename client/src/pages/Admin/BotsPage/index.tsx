import TopBar from "@/components/TopBar";
import { useQuery } from "@tanstack/react-query";
import { botsApi } from "@/apis/bots.api";
import { Link } from "react-router-dom";
import { ArrowDownIcon } from "@/components/Icons";
import { useState } from "react";
import BotSettingForm from "./BotSettingForm";

export interface FormSetting {
  id?: string;
  rssUrl: string;
  intervalMinutes: number;
  postLimit: number;
  isActive: boolean;
}
export interface BotItem {
  id: string;
  email: string;
  name: string;
  avatar: string;
  username: string;
  botSettings?: FormSetting | null;
}
const BotsPage = () => {
  const [expandedBotId, setExpandedBotId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["bots"],
    queryFn: () => botsApi.getBots(),
  });
  const bots = data?.data.data?.bots;
  const toggleExpand = (botId: string) => {
    setExpandedBotId((prev) => (prev === botId ? null : botId));
  };

  return (
    <div className="feed-column">
      <TopBar type="bots" />
      <section className="feed-section">
        {bots?.length === 0 && (
          <div style={{ padding: "24px 20px", textAlign: "center" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              No bots found
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              There are no bots registered on the system yet.
            </p>
          </div>
        )}

        {bots?.map((bot) => {
          const isExpanded = expandedBotId === bot.id;

          return (
            <div
              key={bot.id || `bot-${bot.id}`}
              style={{
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  background: isExpanded
                    ? "var(--bg-secondary)"
                    : "transparent",
                }}
                onClick={() => toggleExpand(bot.id)}
                onMouseEnter={(e) => {
                  if (!isExpanded) {
                    e.currentTarget.style.background = "var(--bg-secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Link
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                    to={`/@${bot.username}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={
                        bot.avatar ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                      }
                      alt={bot.name}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </Link>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "15px",
                        }}
                      >
                        <Link
                          style={{
                            color: "inherit",
                            textDecoration: "none",
                          }}
                          to={`/@${bot.username}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {bot.name}
                        </Link>
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Link
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                        }}
                        to={`/@${bot.username}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        @{bot.username}
                      </Link>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    style={{
                      border: "none",
                      outline: "none",
                      backgroundColor: "var(--text-main)",
                      color: "var(--bg-main)",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.2s ease, opacity 0.2s ease",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(bot.id);
                    }}
                    title={isExpanded ? "Thu gọn" : "Cấu hình bot"}
                  >
                    <ArrowDownIcon size={16} color="var(--bg-main)" />
                  </button>
                </div>
              </div>

              {/* Form Cấu hình Bot */}
              {isExpanded && (
                <div
                  style={{
                    padding: "16px 20px 20px",
                    background: "var(--bg-card)",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "14px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Cấu hình RSS & Tự động đăng bài
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: "rgba(0, 149, 246, 0.12)",
                        color: "var(--accent-blue)",
                        fontWeight: "600",
                      }}
                    >
                      @{bot.username}
                    </span>
                  </div>

                  <BotSettingForm bot={bot} />
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default BotsPage;
