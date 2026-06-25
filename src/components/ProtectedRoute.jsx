import { Navigate, useLocation } from "react-router-dom";
import BaseClass from "../services/BaseClass";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const base = new BaseClass();

  if (!base.isAuthenticated() || base.token === "fake-dev-token") {
    base.clearUser();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
