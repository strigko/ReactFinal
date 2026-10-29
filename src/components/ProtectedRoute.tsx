import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="centerMessage">Checking access...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/requests" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
