import TopBar from "@/components/TopBar";
import { useQuery } from "@tanstack/react-query";
import { botsApi } from "@/apis/bots.api";
import { Link } from "react-router-dom";

const BotsPage = () => {
  const { data } = useQuery({
    queryKey: ["bots"],
    queryFn: () => botsApi.getBots(),
  });
  const bots = data?.data.result?.bots;

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

        {bots?.map((bot) => (
          <div
            key={bot.id || `bot-${bot.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
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
                  >
                    {bot.name}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default BotsPage;
