import { createContext, useContext, useState, type ReactNode } from "react";

interface AppContextType {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
  toastMessage: string | null;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (message) {
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    }
  };

  return (
    <AppContext.Provider
      value={{ isModalOpen, setIsModalOpen, showToast, toastMessage }}
    >
      {children}
    </AppContext.Provider>
  );
};
// Hook to use the context
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
