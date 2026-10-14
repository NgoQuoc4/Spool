const SpoolsFound = ({
  title = "No spools found",
  content = " Try switching feeds or posting a New spool!",
}) => {
  return (
    <>
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-secondary)",
        }}
      >
        <p
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "6px",
            color: "var(--text-main)",
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: "14px" }}>{content}</p>
      </div>
    </>
  );
};

export default SpoolsFound;
