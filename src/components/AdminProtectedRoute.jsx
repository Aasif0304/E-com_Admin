import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children ? children : <Outlet />;
}
