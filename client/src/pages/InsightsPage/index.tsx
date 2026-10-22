import { useState, useMemo } from "react";
import TopBar from "@/components/TopBar";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/apis/users.api";
import { Skeleton } from "@/components/Skeleton";
import { InfoIcon } from "@/components/Icons";

type InsightTab = "views" | "viewers" | "net_followers" | "interactions";

const InsightsPage = () => {
  const [selectedTab, setSelectedTab] = useState<InsightTab>("viewers");

  const { data, isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: () => usersApi.getInsights(),
  });

  const insights = (data?.data as any)?.data || data?.data;

  // Format các số lớn (1K, 1M,...)
  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "0";
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  // Mốc thời gian 7 ngày trước (ví dụ: "Oct 14")
  const sinceDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  const totalViews = insights?.totalViews ?? 0;
  const followersViews = insights?.followersViews ?? 0;
  const nonFollowersViews = insights?.nonFollowersViews ?? 0;
  const followersThisWeek = insights?.followersThisWeek ?? 0;
  const followersLastWeek = insights?.followersLastWeek ?? 0;
  const likesCount = insights?.likesCount ?? 0;
  const repliesCount = insights?.repliesCount ?? 0;
  const repostsCount = insights?.repostsCount ?? 0;

  const totalInteractions = likesCount + repliesCount + repostsCount;

  // Tính phần trăm tăng trưởng Net followers
  const netFollowersChange = useMemo(() => {
    if (followersLastWeek === 0) {
      return followersThisWeek > 0 ? "+100.0%" : "0.0%";
    }
    const diff = followersThisWeek - followersLastWeek;
    const pct = ((diff / followersLastWeek) * 100).toFixed(1);
    return `${diff >= 0 ? "+" : ""}${pct}%`;
  }, [followersThisWeek, followersLastWeek]);

  // Phần trăm tương tác
  const interactionsChange = totalInteractions > 0 ? "+100.0%" : "0.0%";

  // Thông tin hiển thị cho tab hiện tại
  const currentDetail = useMemo(() => {
    switch (selectedTab) {
      case "views":
        return {
          title: "Views",
          value: formatNumber(totalViews),
          changeText: "0.0%",
          isPositive: false,
          subHeader: "Viewer types",
          subCards: [
            {
              label: "Followers",
              value: formatNumber(followersViews),
              subtext:
                totalViews > 0
                  ? `${((followersViews / totalViews) * 100).toFixed(1)}%`
                  : "0.0%",
            },
            {
              label: "Non-followers",
              value: formatNumber(nonFollowersViews),
              subtext:
                totalViews > 0
                  ? `${((nonFollowersViews / totalViews) * 100).toFixed(1)}%`
                  : "0.0%",
            },
          ],
        };
      case "viewers":
        return {
          title: "Viewers",
          value: formatNumber(totalViews),
          changeText: "0.0%",
          isPositive: false,
          subHeader: "Viewer types",
          subCards: [
            {
              label: "Followers",
              value: formatNumber(followersViews),
              subtext:
                totalViews > 0
                  ? `${((followersViews / totalViews) * 100).toFixed(1)}%`
                  : "0.0%",
            },
            {
              label: "Non-followers",
              value: formatNumber(nonFollowersViews),
              subtext:
                totalViews > 0
                  ? `${((nonFollowersViews / totalViews) * 100).toFixed(1)}%`
                  : "0.0%",
            },
          ],
        };
      case "net_followers":
        return {
          title: "Net followers",
          value: `${followersThisWeek >= 0 ? "+" : ""}${formatNumber(followersThisWeek)}`,
          changeText: netFollowersChange,
          isPositive: followersThisWeek > followersLastWeek,
          subHeader: "Follower activity",
          subCards: [
            {
              label: "Tuần này (7 ngày qua)",
              value: `+${formatNumber(followersThisWeek)}`,
              subtext: "Lượt theo dõi mới",
            },
            {
              label: "Tuần trước",
              value: `+${formatNumber(followersLastWeek)}`,
              subtext: "Kỳ trước",
            },
          ],
        };
      case "interactions":
        return {
          title: "Interactions",
          value: formatNumber(totalInteractions),
          changeText: interactionsChange,
          isPositive: totalInteractions > 0,
          subHeader: "Interaction types",
          subCards: [
            {
              label: "Thích",
              value: formatNumber(likesCount),
              subtext:
                totalInteractions > 0
                  ? `${((likesCount / totalInteractions) * 100).toFixed(1)}%`
                  : "0.0%",
            },
            {
              label: "Bình luận",
              value: formatNumber(repliesCount),
              subtext:
                totalInteractions > 0
                  ? `${((repliesCount / totalInteractions) * 100).toFixed(1)}%`
                  : "0.0%",
            },
            {
              label: "Đăng lại",
              value: formatNumber(repostsCount),
              subtext:
                totalInteractions > 0
                  ? `${((repostsCount / totalInteractions) * 100).toFixed(1)}%`
                  : "0.0%",
            },
          ],
        };
    }
  }, [
    selectedTab,
    totalViews,
    followersViews,
    nonFollowersViews,
    followersThisWeek,
    followersLastWeek,
    netFollowersChange,
    totalInteractions,
    interactionsChange,
    likesCount,
    repliesCount,
    repostsCount,
  ]);

  return (
    <div className="feed-column">
      <TopBar type="insights" />
      <section className="feed-section">
        <div style={{ padding: "24px 20px 48px", maxWidth: "680px" }}>
          {/* Header Section: Summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "var(--text-main)",
                letterSpacing: "-0.3px",
              }}
            >
              Summary
            </h2>
            <InfoIcon size={20} />
          </div>

          {/* 4 Summary Cards Grid */}
          {isLoading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginBottom: "36px",
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 14px",
                    borderRadius: "16px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <Skeleton width="60%" height="12px" borderRadius="4px" />
                  <div style={{ margin: "10px 0 6px" }}>
                    <Skeleton width="40%" height="22px" borderRadius="4px" />
                  </div>
                  <Skeleton width="50%" height="10px" borderRadius="4px" />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginBottom: "36px",
                overflowX: "auto",
              }}
            >
              {/* Card 1: Views */}
              <div
                onClick={() => setSelectedTab("views")}
                style={{
                  padding: "16px 14px",
                  borderRadius: "16px",
                  backgroundColor:
                    selectedTab === "views"
                      ? "var(--bg-card-hover)"
                      : "var(--bg-card)",
                  border:
                    selectedTab === "views"
                      ? "1px solid rgba(255, 255, 255, 0.22)"
                      : "1px solid var(--border-color)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  minWidth: "100px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                  }}
                >
                  Views
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "var(--text-main)",
                    margin: "6px 0 4px",
                    lineHeight: "1.2",
                  }}
                >
                  {formatNumber(totalViews)}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    fontWeight: "500",
                  }}
                >
                  0.0%
                </div>
              </div>

              {/* Card 2: Viewers */}
              <div
                onClick={() => setSelectedTab("viewers")}
                style={{
                  padding: "16px 14px",
                  borderRadius: "16px",
                  backgroundColor:
                    selectedTab === "viewers"
                      ? "var(--bg-card-hover)"
                      : "var(--bg-card)",
                  border:
                    selectedTab === "viewers"
                      ? "1px solid rgba(255, 255, 255, 0.22)"
                      : "1px solid var(--border-color)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  minWidth: "100px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                  }}
                >
                  Viewers
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "var(--text-main)",
                    margin: "6px 0 4px",
                    lineHeight: "1.2",
                  }}
                >
                  {formatNumber(totalViews)}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    fontWeight: "500",
                  }}
                >
                  0.0%
                </div>
              </div>

              {/* Card 3: Net followers */}
              <div
                onClick={() => setSelectedTab("net_followers")}
                style={{
                  padding: "16px 14px",
                  borderRadius: "16px",
                  backgroundColor:
                    selectedTab === "net_followers"
                      ? "var(--bg-card-hover)"
                      : "var(--bg-card)",
                  border:
                    selectedTab === "net_followers"
                      ? "1px solid rgba(255, 255, 255, 0.22)"
                      : "1px solid var(--border-color)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  minWidth: "100px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                  }}
                >
                  Net followers
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "var(--text-main)",
                    margin: "6px 0 4px",
                    lineHeight: "1.2",
                  }}
                >
                  {followersThisWeek >= 0 ? "+" : ""}
                  {formatNumber(followersThisWeek)}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color:
                      followersThisWeek > followersLastWeek
                        ? "#00ba7c"
                        : "var(--text-secondary)",
                    fontWeight: "500",
                  }}
                >
                  {netFollowersChange}
                </div>
              </div>

              {/* Card 4: Interactions */}
              <div
                onClick={() => setSelectedTab("interactions")}
                style={{
                  padding: "16px 14px",
                  borderRadius: "16px",
                  backgroundColor:
                    selectedTab === "interactions"
                      ? "var(--bg-card-hover)"
                      : "var(--bg-card)",
                  border:
                    selectedTab === "interactions"
                      ? "1px solid rgba(255, 255, 255, 0.22)"
                      : "1px solid var(--border-color)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  minWidth: "100px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                  }}
                >
                  Interactions
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "var(--text-main)",
                    margin: "6px 0 4px",
                    lineHeight: "1.2",
                  }}
                >
                  {formatNumber(totalInteractions)}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color:
                      totalInteractions > 0
                        ? "#00ba7c"
                        : "var(--text-secondary)",
                    fontWeight: "500",
                  }}
                >
                  {interactionsChange}
                </div>
              </div>
            </div>
          )}

          {/* Active Detail Section */}
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "var(--text-main)",
                }}
              >
                {currentDetail.title}
              </h3>
              <InfoIcon size={20} />
            </div>

            {/* Big Main Number */}
            <div
              style={{
                fontSize: "44px",
                fontWeight: "800",
                color: "var(--text-main)",
                lineHeight: "1.1",
              }}
            >
              {currentDetail.value}
            </div>

            {/* Time range note */}
            <div
              style={{
                fontSize: "14px",
                color: currentDetail.isPositive
                  ? "#00ba7c"
                  : "var(--text-secondary)",
                marginTop: "6px",
                marginBottom: "32px",
                fontWeight: "500",
              }}
            >
              {currentDetail.changeText} since {sinceDate}
            </div>

            {/* Sub-Header: Viewer types / Interaction types */}
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "var(--text-main)",
                marginBottom: "14px",
              }}
            >
              {currentDetail.subHeader}
            </h4>

            {/* Sub-Cards Breakdown */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${currentDetail.subCards.length}, 1fr)`,
                gap: "12px",
              }}
            >
              {currentDetail.subCards.map((sub, index) => (
                <div
                  key={index}
                  style={{
                    padding: "18px 20px",
                    borderRadius: "16px",
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      fontWeight: "500",
                    }}
                  >
                    {sub.label}
                  </div>
                  <div
                    style={{
                      fontSize: "26px",
                      fontWeight: "800",
                      color: "var(--text-main)",
                      marginTop: "6px",
                      lineHeight: "1.2",
                    }}
                  >
                    {sub.value}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      marginTop: "4px",
                      fontWeight: "500",
                    }}
                  >
                    {sub.subtext}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InsightsPage;
