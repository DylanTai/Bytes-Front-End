import { useContext } from "react";
import { Navigate } from "react-router";
import { UserContext } from "../../contexts/UserContext";

// A wrapper to protect routes that require authentication
export default function Protected({ children }) {
  const { user } = useContext(UserContext);

  // If there's no user, redirect to sign-in
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Otherwise, render the protected content
  return children;
}