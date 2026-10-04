import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>
        Page not found
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
        Sorry, this page does not exist.
      </p>
      <Link
        to="/"
        style={{
          display: "inline-block",
          padding: "8px 20px",
          backgroundColor: "var(--accent-white)",
          color: "var(--bg-main)",
          borderRadius: "9999px",
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
