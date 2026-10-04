import { ThreadCard } from "@/components/ThreadCard";
import { CURRENT_USER } from "@/mockData";

const ProfilePage = () => {
  const threads = {};
  return (
    <>
      ProfilePage
      {/* Profile View */}
      <div style={{ padding: "24px 20px" }}>
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            borderRadius: "18px",
            padding: "24px",
            border: "1px solid var(--border-color)",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "var(--text-main)",
                  margin: "0 0 4px",
                }}
              >
                {CURRENT_USER.name}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {CURRENT_USER.username}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    backgroundColor: "var(--bg-pill)",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    color: "var(--text-secondary)",
                  }}
                >
                  spool.app
                </span>
              </div>
            </div>
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              style={{
                width: "74px",
                height: "74px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--border-color)",
              }}
            />
          </div>

          <p
            style={{
              marginTop: "16px",
              fontSize: "14px",
              lineHeight: "1.5",
              color: "var(--text-main)",
            }}
          >
            {CURRENT_USER.bio}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "18px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              {CURRENT_USER.followers} followers
            </span>

            <button
              // onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: "var(--bg-pill)",
                color: "var(--text-main)",
                padding: "6px 18px",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "13px",
                border: "1px solid var(--border-color)",
              }}
            >
              New thread +
            </button>
          </div>
        </div>

        <h4
          style={{
            fontSize: "15px",
            fontWeight: "700",
            marginBottom: "12px",
            color: "var(--text-secondary)",
            paddingLeft: "4px",
          }}
        >
          Threads
        </h4>

        {/* {threads
          .filter(
            (p) =>
              p.author.id === CURRENT_USER.id ||
              p.author.username === CURRENT_USER.username,
          )
          .map((post) => (
            <ThreadCard
              key={post.id}
              post={post}
              currentUser={CURRENT_USER}
              onLikeToggle={handleLikeToggle}
              onRepostToggle={handleRepostToggle}
              onReplyAdded={handleReplyAdded}
              onShare={handleShare}
            />
          ))} */}
      </div>
    </>
  );
};

export default ProfilePage;
