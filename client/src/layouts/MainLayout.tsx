import { CreateThreadModal } from "@/components/CreateThreadModal";
import { Navbar } from "@/components/Navbar";
import { Toast } from "@/components/Toast";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { useAuth } from "@/contexts/AuthContext";
import EditProfileModal from "@/components/EditProfileModal";
import FollowModal from "@/components/FollowModal";
import useNotificationSocket from "@/hooks/useNotificationSocket";
import { notifications } from "@/apis/notifications.api";
import { useQuery } from "@tanstack/react-query";
import ListFollowModal from "@/components/ListFollowModal";

export interface LayoutContextType {
  showToast: (msg: string) => void;
  setIsModalOpen: (open: boolean) => void;
}

const MainLayout = () => {
  const { profile } = useAuth();
  const { setIsModalOpen, showToast, toastMessage, theme, toggleTheme } =
    useAppStore();
  const [activeNavTab, setActiveNavTab] = useState<string>("forYou");

  // 👈 2. Kích hoạt Socket nhận thông báo toàn ứng dụng
  useNotificationSocket();
  const { data: countData } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: () => notifications.countUnreadNotifications(),
    enabled: !!profile, // Chỉ fetch khi có profile
    refetchOnWindowFocus: true, // Tự động refetch khi click tab notification
  });
  const unreadCount = countData?.data?.data ?? 0;

  return (
    <div className="app-container">
      {/* Authentic Threads Left Navigation Rail (Desktop) & Dock (Mobile) */}
      <Navbar
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        openCreateModal={() => setIsModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={profile || undefined}
        unreadCount={unreadCount}
      />

      <main className="main-content">
        <div className="content-area">
          {/* Outlet là nơi render các page như Home, Profile */}
          <Outlet context={{ showToast, setIsModalOpen }} />
        </div>
      </main>

      {/* Button add new post ở góc phải dưới */}
      {/* <button
        className="floating-create-btn"
        onClick={() => setIsModalOpen(true)}
        title="New spool (+)"
        aria-label="New spool"
      >
        <PlusIcon size={22} />
      </button> */}

      {/* Modal để thêm bài post */}
      <CreateThreadModal />

      {/* Modal để edit profile */}
      <EditProfileModal />

      {/* Modal để list follow */}
      <ListFollowModal />

      {/* Modal để follow */}
      <FollowModal />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => showToast("")} />
    </div>
  );
};

export default MainLayout;
