import { INITIAL_THREADS } from "@/mockData";

const LikePage = () => {
  const likedThreads = INITIAL_THREADS.filter((post) => post.isLiked);
  return (
    <div style={{ padding: "24px 20px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
        Liked ({likedThreads.length})
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
        Posts you liked will appear here.
      </p>
    </div>
  );
};

export default LikePage;
