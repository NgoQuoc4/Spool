import { CreateThreadModal } from "@/components/CreateThreadModal";
import { PlusIcon } from "@/components/Icons";
import { Navbar } from "@/components/Navbar";
import { Toast } from "@/components/Toast";
import { CURRENT_USER } from "@/mockData";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

export interface LayoutContextType {
  showToast: (msg: string) => void;
  setIsModalOpen: (open: boolean) => void;
}

const MainLayout = () => {
  const { isModalOpen, setIsModalOpen, showToast, toastMessage } = useApp();
  const [activeNavTab, setActiveNavTab] = useState<string>("forYou");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handlePostCreated = () => {
    showToast("Spool posted successfully");
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
        currentUser={CURRENT_USER}
      />

      <main className="main-content">
        {/* Outlet là nơi render các page như Home, Profile */}
        <Outlet context={{ showToast, setIsModalOpen }} />
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
        currentUser={CURRENT_USER}
        onPostCreated={handlePostCreated}
      />
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => showToast("")} />
    </div>
  );
};

export default MainLayout;
