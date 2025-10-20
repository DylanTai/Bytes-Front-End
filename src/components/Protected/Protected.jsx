import React from "react";
import { Navigate } from "react-router";

// A wrapper to protect routes that require authentication
export default function Protected({ children }) {
  const token = localStorage.getItem("token");

  // If there's no token, redirect to sign-in
  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  // Otherwise, render the protected content
  return children;
}
