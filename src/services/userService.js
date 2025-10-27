const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/users`;

// Refresh token helper
const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) throw new Error("No refresh token found");

  const res = await fetch(`${BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) throw new Error("Token refresh failed");

  const data = await res.json();
  localStorage.setItem("access", data.access);
  return data.access;
};

// Helper function for authenticated requests with automatic token refresh
const fetchWithAuth = async (url, options = {}) => {
  const access = localStorage.getItem("access");
  const authHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (access) {
    authHeaders["Authorization"] = `Bearer ${access}`;
  }

  // Try initial request
  let res = await fetch(url, {
    ...options,
    headers: authHeaders,
  });

  // If unauthorized, try refreshing token and retry
  if (res.status === 401) {
    try {
      const newAccess = await refreshAccessToken();
      authHeaders["Authorization"] = `Bearer ${newAccess}`;

      res = await fetch(url, {
        ...options,
        headers: authHeaders,
      });
    } catch (refreshErr) {
      // Refresh failed, user needs to log in again
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      throw new Error("Session expired. Please log in again.");
    }
  }

  return res;
};

// Get current user
export const getUser = async () => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}/verify/`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Update username
export const updateUsername = async (username) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}/update-username/`, {
      method: "PATCH",
      body: JSON.stringify({ username }),
    });

    const data = await res.json();

    if (!res.ok) {
      const error = new Error("Failed to update username");
      error.response = { data };
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error updating username:", err);
    throw err;
  }
};

// Update password
export const updatePassword = async (passwordData) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}/update-password/`, {
      method: "PATCH",
      body: JSON.stringify(passwordData),
    });

    const data = await res.json();

    if (!res.ok) {
      const error = new Error("Failed to update password");
      error.response = { data };
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error updating password:", err);
    throw err;
  }
};

// Delete account
export const deleteAccount = async (password) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}/delete-account/`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const error = new Error("Failed to delete account");
      error.response = { data };
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error deleting account:", err);
    throw err;
  }
};
