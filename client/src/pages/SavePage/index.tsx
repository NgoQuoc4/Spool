import TopBar from "@/components/TopBar";

const SavePage = () => {
  return (
    <>
      <div className="feed-column">
        <TopBar type="save" />
        <section className="feed-section">
          <div style={{ padding: "24px 20px" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Saved threads
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              When you save a thread, it's added here.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default SavePage;
