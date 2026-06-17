import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const location = useLocation();

  if (!user?.token || user?.token === "fake-dev-token") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}