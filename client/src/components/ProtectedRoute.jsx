import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <LoadingSpinner label="Checking your session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
