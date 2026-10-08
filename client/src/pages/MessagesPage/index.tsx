import { MessageIcon } from "@/components/Icons";
import TopBar from "@/components/TopBar";

const MessagesPage = () => {
  return (
    <>
      <div className="feed-column">
        <TopBar type="message" />
        <section className="feed-section">
          <div style={{ padding: "24px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <MessageIcon size={24} />
              <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>
                Messages
              </h3>
            </div>
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                backgroundColor: "var(--bg-card)",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "var(--text-main)",
                  marginBottom: "8px",
                }}
              >
                Your Inbox
              </p>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                Send direct messages to friends and creators on Spool.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MessagesPage;
