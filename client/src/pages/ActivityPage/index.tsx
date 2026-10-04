import { CommentIcon, HeartIcon, RepostIcon } from "@/components/Icons";

const ActivityPage = () => {
  return (
    <>
      <div style={{ padding: "24px 20px" }}>
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "700",
            marginBottom: "16px",
          }}
        >
          Activity
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "14px",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-input)",
            }}
          >
            <HeartIcon size={22} active={true} />
            <div>
              <div>
                <b style={{ color: "var(--text-main)" }}>_kinh.iia_</b> and 12
                others like your thread
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                }}
              >
                2 hours ago
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "14px",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-input)",
            }}
          >
            <CommentIcon size={22} />
            <div>
              <div>
                <b style={{ color: "var(--text-main)" }}>tranquang425</b>{" "}
                replied: "Đi đâu cơ"
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                }}
              >
                3 hours ago
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "14px",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-input)",
            }}
          >
            <RepostIcon size={22} active={true} />
            <div>
              <div>
                <b style={{ color: "var(--text-main)" }}>2212002quy</b> reposted
                your thread
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                }}
              >
                5 hours ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityPage;
