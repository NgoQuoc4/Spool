const SpoolsFound = () => {
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
          No spools found
        </p>
        <p style={{ fontSize: "14px" }}>
          Try switching feeds or posting a new thread!
        </p>
      </div>
    </>
  );
};

export default SpoolsFound;
