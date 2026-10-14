import "@/App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
// Khởi tạo queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tránh gọi lại API liên tục khi chuyển tab
      retry: 3, // Thử lại 3 lần nếu lỗi
    },
  },
});
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
