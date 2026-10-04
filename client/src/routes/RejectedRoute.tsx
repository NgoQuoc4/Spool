import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PATH } from "@/constants/path";

/** Chặn vào login/register nếu đã đăng nhập → redirect / */
const RejectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return !isAuthenticated ? <Outlet /> : <Navigate to={PATH.HOME} replace />;
};

export default RejectedRoute;
