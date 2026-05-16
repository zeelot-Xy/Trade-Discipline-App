import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

export default function PublicOnlyRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <LoadingSpinner label="Checking your session..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/checklist" replace />;
  }

  return children;
}
