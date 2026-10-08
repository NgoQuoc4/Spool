import { CreateThreadModal } from "@/components/CreateThreadModal";
import { PlusIcon } from "@/components/Icons";
import { Navbar } from "@/components/Navbar";
import { Toast } from "@/components/Toast";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface LayoutContextType {
  showToast: (msg: string) => void;
  setIsModalOpen: (open: boolean) => void;
}

const MainLayout = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const {
    isModalOpen,
    setIsModalOpen,
    showToast,
    toastMessage,
    theme,
    toggleTheme,
  } = useApp();
  const [activeNavTab, setActiveNavTab] = useState<string>("forYou");

  // Apply theme to document
  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["tweets"] });
    showToast("Đã đăng bài!");
  };
  return (
    <div className="app-container">
      {/* Authentic Threads Left Navigation Rail (Desktop) & Dock (Mobile) */}
      <Navbar
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        openCreateModal={() => setIsModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={profile}
      />

      <main className="main-content">
        <div className="content-area">
          {/* Outlet là nơi render các page như Home, Profile */}
          <Outlet context={{ showToast, setIsModalOpen }} />
        </div>
      </main>

      {/* Button add new post ở góc phải dưới */}
      <button
        className="floating-create-btn"
        onClick={() => setIsModalOpen(true)}
        title="New thread (+)"
        aria-label="New thread"
      >
        <PlusIcon size={22} />
      </button>

      {/* Modal để thêm bài post */}
      <CreateThreadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => showToast("")} />
    </div>
  );
};

export default MainLayout;
