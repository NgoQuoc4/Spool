import type { ColumnItem, ColumnKey } from "@/types/column.types";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AppContextType {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
  toastMessage: string | null;
  columns: ColumnItem[];
  setColumns: (columns: ColumnItem[]) => void;
  addColumn: (column: ColumnItem) => void;
  removeColumn: (columnType: ColumnKey) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export type ColumnType = {
  type:
    | "search"
    | "activity"
    | "profile"
    | "home"
    | "feed"
    | "insights"
    | "save"
    | "follow"
    | "ghost"
    | "like"
    | "message"
    | "archive"
    | "other_feeds";
  label: string;
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return localStorage.getItem("theme") as "dark" | "light";
  });
  // Start ------------------------------ Toast ---------------------------------------
  const showToast = (message: string) => {
    setToastMessage(message);
    if (message) {
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    }
  };
  // End ------------------------------ Toast -----------------------------------------

  // Start ------------------------------ Theme ---------------------------------------
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // End ------------------------------ Theme -----------------------------------------

  // Start ------------------------------ Columns --------------------------------------
  useEffect(() => {
    const savedColumns = localStorage.getItem("columns");
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, []);
  const addColumn = (column: ColumnType) => {
    setColumns((prevColumns) => [...prevColumns, column]);
    localStorage.setItem("columns", JSON.stringify([...columns, column]));
  };
  const removeColumn = (columnType: string) => {
    setColumns((prevColumns) =>
      prevColumns.filter((col) => col.type !== columnType),
    );
    const filteredColumns = columns.filter((col) => col.type !== columnType);
    localStorage.setItem("columns", JSON.stringify(filteredColumns));
  };

  return (
    <AppContext.Provider
      value={{
        isModalOpen,
        setIsModalOpen,
        showToast,
        toastMessage,
        columns,
        setColumns,
        addColumn,
        removeColumn,
        theme,
        toggleTheme,
      }}
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
