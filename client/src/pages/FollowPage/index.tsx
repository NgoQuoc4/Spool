import TopBar from "@/components/TopBar";

const FollowPage = () => {
  return (
    <>
      <div className="feed-column">
        <TopBar type="follow" />
        <section className="feed-section">
          <div style={{ padding: "24px 20px", textAlign: "center" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              Follows
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              You’ll see posts from people you follow here. Start following some
              accounts to see their posts!
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default FollowPage;
