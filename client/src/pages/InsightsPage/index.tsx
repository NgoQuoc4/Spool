import TopBar from "@/components/TopBar";

const InsightsPage = () => {
  return (
    <>
      <div className="feed-column">
        <TopBar type="insights" />
        <section className="feed-section">
          <div style={{ padding: "24px 20px" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              Insights
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "14px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Views
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    marginTop: "4px",
                  }}
                >
                  48.2K
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#00ba7c",
                    marginTop: "4px",
                  }}
                >
                  ↑ 24% vs last week
                </div>
              </div>
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Engagements
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    marginTop: "4px",
                  }}
                >
                  3.8K
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#00ba7c",
                    marginTop: "4px",
                  }}
                >
                  ↑ 18% vs last week
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default InsightsPage;
