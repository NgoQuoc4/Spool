import React from "react";
import SearchPage from "@/pages/SearchPage";
import ActivityPage from "@/pages/ActivityPage";
import ProfilePage from "@/pages/ProfilePage";
import InsightsPage from "@/pages/InsightsPage";
import ArchivePage from "@/pages/ArchivePage";
import SavePage from "@/pages/SavePage";
import FollowPage from "@/pages/FollowPage";
import GhostPage from "@/pages/GhostPage";
import LikePage from "@/pages/LikePage";
import MessagesPage from "@/pages/MessagesPage";

const COLUMN_CONTENT: Record<string, React.ComponentType> = {
  search: SearchPage,
  activity: ActivityPage,
  profile: ProfilePage,
  insights: InsightsPage,
  archive: ArchivePage,
  saved: SavePage,
  follow: FollowPage,
  ghost: GhostPage,
  insight: InsightsPage,
  like: LikePage,
  message: MessagesPage,
  save: SavePage,
};

interface ColumnPanelProps {
  label: string;
  type: string;
}

export const ColumnPanel = ({ label, type }: ColumnPanelProps) => {
  const Content = COLUMN_CONTENT[type];

  return (
    <>
      {Content ? (
        <Content />
      ) : (
        <div
          style={{
            padding: "32px 16px",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          Nội dung "{label}" sẽ hiển thị ở đây.
        </div>
      )}
    </>
  );
};
