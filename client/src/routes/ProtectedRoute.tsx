import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PATH } from "@/constants/path";

/** Chặn vào nếu chưa đăng nhập → redirect /login */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null; // đang kiểm tra session
  console.log("isAuthenticated", isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to={PATH.LOGIN} replace />;
};

export default ProtectedRoute;
