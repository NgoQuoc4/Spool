import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useAppStore } from "@/stores/useAppStore";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/apis/users.api";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/constants/path";
import "./SettingPage.css";
import {
  AccountsCenterIcon,
  AccountStatusIcon,
  BlockedProfilesIcon,
  ChevronRight,
  ContentPreferencesIcon,
  HelpIcon,
  MessagesIcon,
  MoreSettingsIcon,
  OnlineStatusIcon,
  PrivacyLockIcon,
  PrivateLikesIcon,
  RestrictedProfilesIcon,
  SupervisionIcon,
  TagsMentionsIcon,
} from "@/components/Icons";

type SettingTab =
  | "accounts"
  | "supervision"
  | "privacy"
  | "content"
  | "status"
  | "more"
  | "help";

const SettingPage = () => {
  const navigate = useNavigate();
  const { showToast, theme, toggleTheme, setColumns } = useAppStore();
  const { logout, profile } = useAuth();

  // Selected tab - default "privacy" matching screenshot
  const [activeTab, setActiveTab] = useState<SettingTab>("privacy");

  // Privacy toggles & states
  const [isPrivateProfile, setIsPrivateProfile] = useState<boolean>(true);
  const [isOnlineStatusOn, setIsOnlineStatusOn] = useState<boolean>(true);
  const [isPrivateLikesOn, setIsPrivateLikesOn] = useState<boolean>(true);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showPrivateModal, setShowPrivateModal] = useState<boolean>(false);
  const [showGenericModal, setShowGenericModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({ isOpen: false, title: "", description: "" });

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const getTabTitle = (tab: SettingTab) => {
    switch (tab) {
      case "accounts":
        return "Accounts Center";
      case "privacy":
        return "Privacy";
      case "content":
        return "Content preferences";
      case "status":
        return "Account status";
      case "more":
        return "More settings";
      case "help":
        return "Help";
      default:
        return "Privacy";
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu mới xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Mật khẩu mới phải từ 6 ký tự trở lên");
      return;
    }

    try {
      setIsSubmittingPassword(true);
      await usersApi.changePassword({
        oldPassword,
        password: newPassword,
        confirmPassword,
      });
      showToast("Đổi mật khẩu thành công!");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại!";
      showToast(errorMsg);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleTogglePrivateProfile = () => {
    const nextState = !isPrivateProfile;
    setIsPrivateProfile(nextState);
    setShowPrivateModal(false);
    showToast(
      nextState
        ? "Đã chuyển tài khoản sang chế độ Riêng tư"
        : "Đã chuyển tài khoản sang chế độ Công khai",
    );
  };

  const handleResetColumns = () => {
    setColumns([]);
    showToast("Đã thiết lập lại bố cục cột về mặc định");
  };

  const handleLogout = async () => {
    await logout();
    navigate(PATH.LOGIN);
  };

  return (
    <>
      <div className="feed-column setting-column">
        <TopBar type="setting" />
        <section className="feed-section setting-section">
          <div className="setting-container">
            {/* Header Title matching screenshot "Privacy" */}
            <h1 className="setting-heading">{getTabTitle(activeTab)}</h1>

            {/* 2-Column Setting Card */}
            <div className="setting-card">
              {/* Left Navigation Column */}
              <div className="setting-nav">
                {/* 1. Accounts Center */}
                <button
                  type="button"
                  className={`setting-nav-item ${
                    activeTab === "accounts" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("accounts")}
                >
                  <span className="setting-nav-icon">
                    <AccountsCenterIcon />
                  </span>
                  <div className="setting-nav-text">
                    <span className="setting-nav-title">Accounts Center</span>
                    <span className="setting-nav-desc">
                      Password, security, personal details, connected
                      experiences, ad preferences
                    </span>
                  </div>
                </button>

                {/* 3. Privacy */}
                <button
                  type="button"
                  className={`setting-nav-item ${
                    activeTab === "privacy" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("privacy")}
                >
                  <span className="setting-nav-icon">
                    <PrivacyLockIcon />
                  </span>
                  <span className="setting-nav-title">Privacy</span>
                </button>

                {/* 4. Content preferences */}
                <button
                  type="button"
                  className={`setting-nav-item ${
                    activeTab === "content" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("content")}
                >
                  <span className="setting-nav-icon">
                    <ContentPreferencesIcon />
                  </span>
                  <span className="setting-nav-title">Content preferences</span>
                </button>

                {/* 5. Account status */}
                <button
                  type="button"
                  className={`setting-nav-item ${
                    activeTab === "status" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("status")}
                >
                  <span className="setting-nav-icon">
                    <AccountStatusIcon />
                  </span>
                  <span className="setting-nav-title">Account status</span>
                </button>

                {/* 6. More settings */}
                <button
                  type="button"
                  className={`setting-nav-item ${
                    activeTab === "more" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("more")}
                >
                  <span className="setting-nav-icon">
                    <MoreSettingsIcon />
                  </span>
                  <span className="setting-nav-title">More settings</span>
                </button>

                {/* 7. Help */}
                <button
                  type="button"
                  className={`setting-nav-item ${
                    activeTab === "help" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("help")}
                >
                  <span className="setting-nav-icon">
                    <HelpIcon />
                  </span>
                  <span className="setting-nav-title">Help</span>
                </button>
              </div>

              {/* Right Content Panel */}
              <div className="setting-content-panel">
                {/* TAB: PRIVACY (Exact Match with Image) */}
                {activeTab === "privacy" && (
                  <div className="setting-list">
                    {/* 1. Private profile */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() => setShowPrivateModal(true)}
                    >
                      <div className="setting-list-row-left">
                        <PrivacyLockIcon />
                        <span className="setting-list-row-title">
                          Private profile
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-status-badge">
                          {isPrivateProfile ? "Private" : "Public"}
                        </span>
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    {/* 2. Tags and mentions */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() =>
                        setShowGenericModal({
                          isOpen: true,
                          title: "Tags and mentions",
                          description:
                            "Chọn ai có thể gắn thẻ bạn trong các bài viết và bình luận. Mặc định cho phép người theo dõi gắn thẻ.",
                        })
                      }
                    >
                      <div className="setting-list-row-left">
                        <TagsMentionsIcon />
                        <span className="setting-list-row-title">
                          Tags and mentions
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    {/* 3. Online status */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() => {
                        setIsOnlineStatusOn((prev) => !prev);
                        showToast(
                          !isOnlineStatusOn
                            ? "Đã bật trạng thái hoạt động"
                            : "Đã ẩn trạng thái hoạt động",
                        );
                      }}
                    >
                      <div className="setting-list-row-left">
                        <OnlineStatusIcon />
                        <span className="setting-list-row-title">
                          Online status
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-status-badge">
                          {isOnlineStatusOn ? "Đang bật" : "Đã tắt"}
                        </span>
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    {/* 4. Messages */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() => navigate(PATH.MESSAGES)}
                    >
                      <div className="setting-list-row-left">
                        <MessagesIcon />
                        <span className="setting-list-row-title">Messages</span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    {/* 5. Restricted profiles */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() =>
                        setShowGenericModal({
                          isOpen: true,
                          title: "Restricted profiles",
                          description:
                            "Bảo vệ tài khoản mà không cần chặn. Người bị giới hạn sẽ không thấy khi bạn trực tuyến hoặc khi bạn đọc tin nhắn của họ.",
                        })
                      }
                    >
                      <div className="setting-list-row-left">
                        <RestrictedProfilesIcon />
                        <span className="setting-list-row-title">
                          Restricted profiles
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    {/* 6. Blocked profiles */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() =>
                        setShowGenericModal({
                          isOpen: true,
                          title: "Blocked profiles",
                          description:
                            "Bạn chưa chặn tài khoản nào. Những tài khoản bị chặn sẽ không thể xem trang cá nhân hoặc bài viết của bạn.",
                        })
                      }
                    >
                      <div className="setting-list-row-left">
                        <BlockedProfilesIcon />
                        <span className="setting-list-row-title">
                          Blocked profiles
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    {/* 7. Private likes */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() => {
                        setIsPrivateLikesOn((prev) => !prev);
                        showToast(
                          !isPrivateLikesOn
                            ? "Đã ẩn danh sách bài viết bạn đã thích"
                            : "Đã hiện danh sách bài viết đã thích trên trang cá nhân",
                        );
                      }}
                    >
                      <div className="setting-list-row-left">
                        <PrivateLikesIcon />
                        <span className="setting-list-row-title">
                          Private likes
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-status-badge">
                          {isPrivateLikesOn ? "Ẩn" : "Hiện"}
                        </span>
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* TAB: ACCOUNTS CENTER */}
                {activeTab === "accounts" && (
                  <div className="setting-list">
                    <div className="setting-panel-header">
                      <h3>Trung tâm tài khoản Spool</h3>
                      <p>
                        Quản lý trải nghiệm kết nối và cài đặt bảo mật cho tài
                        khoản ({profile?.email || "User"}).
                      </p>
                    </div>

                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <div className="setting-list-row-left">
                        <PrivacyLockIcon />
                        <span className="setting-list-row-title">
                          Mật khẩu và bảo mật (Đổi mật khẩu)
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() =>
                        setShowGenericModal({
                          isOpen: true,
                          title: "Thông tin cá nhân",
                          description: `Email: ${
                            profile?.email || "Chưa cập nhật"
                          }\nTên: ${profile?.name || ""}\nTên người dùng: @${
                            profile?.username || ""
                          }`,
                        })
                      }
                    >
                      <div className="setting-list-row-left">
                        <AccountStatusIcon />
                        <span className="setting-list-row-title">
                          Thông tin cá nhân
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* TAB: SUPERVISION */}
                {activeTab === "supervision" && (
                  <div className="setting-list">
                    <div className="setting-panel-header">
                      <h3>Giám sát tài khoản thiếu niên</h3>
                      <p>
                        Công cụ hỗ trợ phụ huynh quản lý thời gian sử dụng và sự
                        an toàn trên Spool.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() =>
                        showToast("Tính năng giám sát tài khoản đang khả dụng")
                      }
                    >
                      <div className="setting-list-row-left">
                        <SupervisionIcon />
                        <span className="setting-list-row-title">
                          Thiết lập tài khoản gia đình
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* TAB: CONTENT PREFERENCES */}
                {activeTab === "content" && (
                  <div className="setting-list">
                    <div className="setting-panel-header">
                      <h3>Tùy chọn nội dung</h3>
                      <p>
                        Kiểm soát những nội dung bạn muốn thấy trên bảng tin.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() =>
                        showToast("Đã cập nhật bộ lọc nội dung nhạy cảm")
                      }
                    >
                      <div className="setting-list-row-left">
                        <ContentPreferencesIcon />
                        <span className="setting-list-row-title">
                          Nội dung nhạy cảm (Tiêu chuẩn)
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* TAB: ACCOUNT STATUS */}
                {activeTab === "status" && (
                  <div className="setting-list">
                    <div className="setting-panel-header">
                      <h3>Trạng thái tài khoản</h3>
                      <p>
                        Xem thông tin về những bài viết vi phạm hoặc cảnh báo
                        tiêu chuẩn cộng đồng.
                      </p>
                    </div>
                    <div style={{ padding: "16px 12px" }}>
                      <p style={{ color: "#10b981", fontWeight: 600 }}>
                        ✓ Tài khoản của bạn đang ở trạng thái tốt. Chưa có vi
                        phạm nào được ghi nhận.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB: MORE SETTINGS */}
                {activeTab === "more" && (
                  <div className="setting-list">
                    <div className="setting-panel-header">
                      <h3>Cài đặt khác</h3>
                      <p>
                        Tùy chỉnh giao diện, bố cục đa cột và phiên đăng nhập.
                      </p>
                    </div>

                    {/* Dark/Light mode toggle */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={toggleTheme}
                    >
                      <div className="setting-list-row-left">
                        <MoreSettingsIcon />
                        <span className="setting-list-row-title">
                          Giao diện:{" "}
                          {theme === "dark" ? "Chế độ tối" : "Chế độ sáng"}
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-status-badge">
                          {theme === "dark" ? "Dark" : "Light"}
                        </span>
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    {/* Reset Multi-columns */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={handleResetColumns}
                    >
                      <div className="setting-list-row-left">
                        <MoreSettingsIcon />
                        <span className="setting-list-row-title">
                          Thiết lập lại các cột đa luồng
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    {/* Log out */}
                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={handleLogout}
                      style={{ color: "var(--error-color, #ff3040)" }}
                    >
                      <div className="setting-list-row-left">
                        <BlockedProfilesIcon />
                        <span className="setting-list-row-title">
                          Đăng xuất khỏi tài khoản
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* TAB: HELP */}
                {activeTab === "help" && (
                  <div className="setting-list">
                    <div className="setting-panel-header">
                      <h3>Hỗ trợ và Trợ giúp</h3>
                      <p>Giải đáp thắc mắc và báo cáo sự cố kỹ thuật.</p>
                    </div>

                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() => navigate(PATH.REPORT)}
                    >
                      <div className="setting-list-row-left">
                        <HelpIcon />
                        <span className="setting-list-row-title">
                          Báo cáo sự cố hoặc đóng góp ý kiến
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="setting-list-row"
                      onClick={() =>
                        setShowGenericModal({
                          isOpen: true,
                          title: "Về Spool (Threads Clone)",
                          description:
                            "Phiên bản: 1.0.0\nNền tảng mạng xã hội kết nối cộng đồng, lấy cảm hứng từ Meta Threads.",
                        })
                      }
                    >
                      <div className="setting-list-row-left">
                        <HelpIcon />
                        <span className="setting-list-row-title">
                          Điều khoản & Chính sách quyền riêng tư
                        </span>
                      </div>
                      <div className="setting-list-row-right">
                        <span className="setting-chevron">
                          <ChevronRight />
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- MODAL: CHANGE PASSWORD --- */}
      {showPasswordModal && (
        <div
          className="setting-modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="setting-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="setting-modal-title">Đổi mật khẩu</h2>
            <p className="setting-modal-desc">
              Mật khẩu mới của bạn phải có ít nhất 6 ký tự và bao gồm chữ và số.
            </p>
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="setting-form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="setting-form-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="setting-form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  className="setting-form-input"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="setting-form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="setting-form-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="setting-modal-actions">
                <button
                  type="button"
                  className="setting-btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="setting-btn-primary"
                  disabled={isSubmittingPassword}
                >
                  {isSubmittingPassword ? "Đang lưu..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PRIVATE PROFILE TOGGLE --- */}
      {showPrivateModal && (
        <div
          className="setting-modal-overlay"
          onClick={() => setShowPrivateModal(false)}
        >
          <div
            className="setting-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="setting-modal-title">
              {isPrivateProfile
                ? "Chuyển sang tài khoản công khai?"
                : "Chuyển sang tài khoản riêng tư?"}
            </h2>
            <p className="setting-modal-desc">
              {isPrivateProfile
                ? "Bất kỳ ai cũng có thể xem bài viết, lượt thích và danh sách người theo dõi của bạn. Người dùng không cần gửi yêu cầu theo dõi."
                : "Chỉ những người bạn phê duyệt mới có thể theo dõi và xem các bài viết của bạn. Người theo dõi hiện tại sẽ không bị ảnh hưởng."}
            </p>

            <div className="setting-modal-actions">
              <button
                type="button"
                className="setting-btn-secondary"
                onClick={() => setShowPrivateModal(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="setting-btn-primary"
                onClick={handleTogglePrivateProfile}
              >
                {isPrivateProfile ? "Công khai" : "Riêng tư"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: GENERIC INFO POPUP --- */}
      {showGenericModal.isOpen && (
        <div
          className="setting-modal-overlay"
          onClick={() =>
            setShowGenericModal({ isOpen: false, title: "", description: "" })
          }
        >
          <div
            className="setting-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="setting-modal-title">{showGenericModal.title}</h2>
            <p
              className="setting-modal-desc"
              style={{ whiteSpace: "pre-line" }}
            >
              {showGenericModal.description}
            </p>

            <div className="setting-modal-actions">
              <button
                type="button"
                className="setting-btn-primary"
                onClick={() =>
                  setShowGenericModal({
                    isOpen: false,
                    title: "",
                    description: "",
                  })
                }
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingPage;
