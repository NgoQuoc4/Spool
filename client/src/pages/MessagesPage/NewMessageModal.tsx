import { searchApi } from "@/apis/search.api";
import { CloseIcon, VerifiedBadge } from "@/components/Icons";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: (isOpen: boolean) => void;
  onSelectUser: (selectedUser: any) => void;
}

const NewMessageModal = ({
  isOpen,
  onClose,
  onSelectUser,
}: NewMessageModalProps) => {
  const [newRecipientId, setNewRecipientId] = useState("");

  // HANDLER: Tìm kiếm người dùng để bắt đầu cuộc hội thoại
  const debouncedSearch = useDebounce(newRecipientId, 400);
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", debouncedSearch, "profiles"],
    queryFn: () =>
      searchApi.searchUsers({
        query: debouncedSearch,
        tab: "profiles",
      }),
    enabled: debouncedSearch.length > 0,
  });
  const searchUsers = searchResults?.data?.data?.users;

  return (
    <>
      {isOpen && (
        <div className="new-msg-modal-overlay" onClick={() => onClose(false)}>
          <div className="new-msg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="new-msg-modal-header">
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                New Message
              </h3>
              <button
                className="messages-icon-btn"
                onClick={() => onClose(false)}
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="new-msg-modal-body">
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Search people:
                </label>
                <input
                  type="text"
                  placeholder="Search by name or @username..."
                  value={newRecipientId}
                  onChange={(e) => setNewRecipientId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-main)",
                    outline: "none",
                    fontSize: "14px",
                  }}
                  autoFocus
                />
              </div>

              {/* Danh sách kết quả tìm kiếm */}
              <div
                style={{
                  maxHeight: "320px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {isLoading && (
                  <div
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                      fontSize: "14px",
                    }}
                  >
                    Searching...
                  </div>
                )}

                {!isLoading &&
                  debouncedSearch.length > 0 &&
                  searchUsers?.length === 0 && (
                    <div
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                      }}
                    >
                      No users found for "{debouncedSearch}"
                    </div>
                  )}

                {searchUsers?.map((s: any) => (
                  <div
                    key={s.id || s._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--bg-main)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                    }}
                    onClick={() => onSelectUser(s)}
                  >
                    {s.avatar ? (
                      <img
                        src={s.avatar}
                        alt={s.name}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          backgroundColor: "var(--bg-pill)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          fontSize: "16px",
                          color: "var(--text-main)",
                          border: "1px solid var(--border-color)",
                          flexShrink: 0,
                        }}
                      >
                        {(s.name || s.username || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "15px",
                            color: "var(--text-main)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {s.name || s.username}
                        </span>
                        {s.verify === "Verified" && <VerifiedBadge size={14} />}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        @{s.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewMessageModal;
