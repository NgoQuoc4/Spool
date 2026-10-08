import TopBar from "@/components/TopBar";

const ArchivePage = () => {
  return (
    <>
      <div className="feed-column">
        <TopBar type="archive" />
        <section className="feed-section">
          <div style={{ padding: "24px 20px", textAlign: "center" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              Archive
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Your archived threads will appear here safely stored.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default ArchivePage;
