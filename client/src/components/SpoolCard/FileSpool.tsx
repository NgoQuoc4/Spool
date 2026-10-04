import React from "react";
import { FileIcon, DownloadIcon } from "../Icons";

export interface FileAttachmentProps {
  name: string;
  size?: string;
  url: string;
}

export const FileSpool: React.FC<{ file: FileAttachmentProps }> = ({
  file,
}) => {
  const getExtension = (filename: string) => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop()?.toUpperCase() : "FILE";
  };

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      download={file.name}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        borderRadius: "14px",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-input)",
        marginBottom: "10px",
        textDecoration: "none",
        color: "inherit",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
        e.currentTarget.style.borderColor = "var(--text-secondary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--bg-input)";
        e.currentTarget.style.borderColor = "var(--border-color)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            backgroundColor: "var(--bg-pill)",
            color: "var(--accent-blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FileIcon size={20} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text-main)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: "2px",
            }}
          >
            {getExtension(file.name)} {file.size ? `• ${file.size}` : ""}
          </span>
        </div>
      </div>

      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          flexShrink: 0,
          marginLeft: "12px",
        }}
        title="Download"
      >
        <DownloadIcon size={18} />
      </div>
    </a>
  );
};

export default FileSpool;
