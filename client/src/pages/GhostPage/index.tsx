import TopBar from "@/components/TopBar";

const GhostPage = () => {
  return (
    <>
      <div className="feed-column">
        <TopBar type="ghost" />
        <section className="feed-section">
          <div style={{ padding: "24px 20px", textAlign: "center" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              Ghost posts
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Ghost posts disappear after 24 hours. You don't have any active
              ghost posts.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default GhostPage;
