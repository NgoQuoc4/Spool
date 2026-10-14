import { create } from "zustand";
import type { Author, ThreadPost } from "@/types";
import type { ColumnItem } from "@/types/column.types";

export type ColumnType = ColumnItem;

interface AppState {
  // ---------------------- Theme --------------------------------
  theme: "dark" | "light";
  toggleTheme: () => void;
  // ---------------------- Create Thread Modal -------------------
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;

  // ---------------------- Toast Notification -------------------
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // ---------------------- Multi Columns ------------------------
  columns: ColumnItem[];
  setColumns: (columns: ColumnItem[]) => void;
  addColumn: (column: ColumnItem) => void;
  removeColumn: (columnIdOrType: string) => void;

  // ---------------------- Quote Tweet --------------------------
  quoteTarget: ThreadPost | null;
  setQuoteTarget: (post: ThreadPost | null) => void;
  openQuoteModal: (post: ThreadPost) => void;
  closeQuoteModal: () => void;

  // ---------------------- Edit Profile Modal -------------------
  isModalEditProfileOpen: boolean;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;

  // ---------------------- Follow Modal -------------------------
  isModalFollowOpen: boolean;
  openFollowModal: () => void;
  closeFollowModal: () => void;
  followTarget: Author;
  setFollowTarget: (target: Author) => void;
}

const defaultFollowTarget: Author = {
  id: "",
  name: "",
  username: "",
  avatar: "",
  verified: false,
  bio: "",
  followers: "",
  isFollowing: false,
};

// Khởi tạo theme ban đầu từ localStorage
const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
  const theme = savedTheme || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
};

// Khởi tạo danh sách columns từ localStorage
const getInitialColumns = (): ColumnItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("columns");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

let toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const useAppStore = create<AppState>((set, get) => ({
  // Create Modal
  isModalOpen: false,
  setIsModalOpen: (open) => set({ isModalOpen: open }),

  // Toast
  toastMessage: null,
  showToast: (message: string) => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    set({ toastMessage: message });
    if (message) {
      toastTimeoutId = setTimeout(() => {
        set({ toastMessage: null });
        toastTimeoutId = null;
      }, 2500);
    }
  },

  // Columns
  columns: getInitialColumns(),
  setColumns: (columns) => {
    localStorage.setItem("columns", JSON.stringify(columns));
    set({ columns });
  },
  addColumn: (column) => {
    const colId =
      column.id ||
      (column.username ? `${column.type}-${column.username}` : column.type);
    const newCol: ColumnItem = { ...column, id: colId };
    const prevColumns = get().columns;

    // 1. Nếu là cột profile và đã có cột profile -> Cập nhật sang username mới
    if (column.type === "profile") {
      const existingProfileIndex = prevColumns.findIndex(
        (col) => col.type === "profile",
      );
      if (existingProfileIndex !== -1) {
        if (prevColumns[existingProfileIndex].username === column.username) {
          return;
        }
        const updated = [...prevColumns];
        updated[existingProfileIndex] = newCol;
        localStorage.setItem("columns", JSON.stringify(updated));
        set({ columns: updated });
        return;
      }
    }

    // 2. Kiểm tra cột đã tồn tại chưa
    const exists = prevColumns.some(
      (col) =>
        col.id === colId ||
        (col.type === column.type && col.username === column.username),
    );
    if (exists) {
      get().showToast("Cột này đã tồn tại");
      return;
    }

    const next = column.username
      ? [newCol, ...prevColumns]
      : [...prevColumns, newCol];
    localStorage.setItem("columns", JSON.stringify(next));
    set({ columns: next });
  },
  removeColumn: (columnIdOrType) => {
    const next = get().columns.filter(
      (col) => col.id !== columnIdOrType && col.type !== columnIdOrType,
    );
    localStorage.setItem("columns", JSON.stringify(next));
    set({ columns: next });
  },

  // Theme
  theme: getInitialTheme(),
  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    set({ theme: nextTheme });
  },

  // Quote
  quoteTarget: null,
  setQuoteTarget: (post) => set({ quoteTarget: post }),
  openQuoteModal: (post) => set({ quoteTarget: post, isModalOpen: true }),
  closeQuoteModal: () => set({ quoteTarget: null, isModalOpen: false }),

  // Edit Profile
  isModalEditProfileOpen: false,
  openEditProfileModal: () => set({ isModalEditProfileOpen: true }),
  closeEditProfileModal: () => set({ isModalEditProfileOpen: false }),

  // Follow Modal
  isModalFollowOpen: false,
  openFollowModal: () => set({ isModalFollowOpen: true }),
  closeFollowModal: () => set({ isModalFollowOpen: false }),
  followTarget: defaultFollowTarget,
  setFollowTarget: (target) => set({ followTarget: target }),
}));
