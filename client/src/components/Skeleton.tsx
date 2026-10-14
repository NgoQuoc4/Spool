import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  circle?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "16px",
  borderRadius = "6px",
  circle = false,
  style,
  className = "",
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? "50%" : borderRadius,
        flexShrink: 0,
        ...style,
      }}
    />
  );
};

export const ThreadCardSkeleton: React.FC = () => {
  return (
    <article
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border-subtle)",
        position: "relative",
      }}
      className="thread-card animate-fade-in"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px minmax(0, 1fr)",
          gap: "0 8px",
        }}
      >
        {/* Avatar skeleton */}
        <div>
          <Skeleton width="42px" height="42px" circle />
        </div>

        {/* Content body skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* User & Time header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Skeleton width="110px" height="15px" borderRadius="4px" />
            <Skeleton width="40px" height="12px" borderRadius="4px" />
          </div>

          {/* Text lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "4px 0" }}>
            <Skeleton width="94%" height="13px" borderRadius="4px" />
            <Skeleton width="80%" height="13px" borderRadius="4px" />
            <Skeleton width="48%" height="13px" borderRadius="4px" />
          </div>

          {/* Action buttons bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px", marginTop: "4px" }}>
            <Skeleton width="18px" height="18px" borderRadius="4px" />
            <Skeleton width="18px" height="18px" borderRadius="4px" />
            <Skeleton width="18px" height="18px" borderRadius="4px" />
            <Skeleton width="18px" height="18px" borderRadius="4px" />
          </div>
        </div>
      </div>
    </article>
  );
};

export const ThreadListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <ThreadCardSkeleton key={index} />
      ))}
    </>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        borderRadius: "18px",
        padding: "24px",
        border: "1px solid var(--border-color)",
        marginBottom: "16px",
      }}
      className="animate-fade-in"
    >
      {/* Top section: name & avatar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Skeleton width="160px" height="24px" borderRadius="6px" />
          <Skeleton width="90px" height="14px" borderRadius="4px" />
        </div>
        <Skeleton width="74px" height="74px" circle />
      </div>

      {/* Bio lines */}
      <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <Skeleton width="86%" height="14px" borderRadius="4px" />
        <Skeleton width="55%" height="14px" borderRadius="4px" />
      </div>

      {/* Follower counts & button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Skeleton width="85px" height="13px" borderRadius="4px" />
          <Skeleton width="85px" height="13px" borderRadius="4px" />
        </div>
        <Skeleton width="96px" height="30px" borderRadius="10px" />
      </div>
    </div>
  );
};

export const UserCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
      className="animate-fade-in"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Skeleton width="44px" height="44px" circle />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton width="110px" height="15px" borderRadius="4px" />
          <Skeleton width="80px" height="12px" borderRadius="4px" />
        </div>
      </div>
      <Skeleton width="80px" height="32px" borderRadius="9999px" />
    </div>
  );
};

export const UserListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <UserCardSkeleton key={index} />
      ))}
    </>
  );
};

export default Skeleton;
