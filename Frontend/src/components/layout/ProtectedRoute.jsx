import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Protect routes for logged in users and admin users.
export function ProtectedRoute({ children, requireAdmin }) {
  const { isSignedIn, isAdmin, profileLoaded } = useAuth();

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !profileLoaded) {
    return <p className="routeLoading">Loading account…</p>;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
