import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthorized(Boolean(user));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 🔒 While checking, show NOTHING (no hints)
  if (loading) return null;

  // 🔥 Unauthorized → HOME (not admin login)
  return authorized ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
