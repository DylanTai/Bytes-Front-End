const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/users`;

// Helper function for authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const access = localStorage.getItem("access");
  const authHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (access) {
    authHeaders["Authorization"] = `Bearer ${access}`;
  }

  return await fetch(url, {
    ...options,
    headers: authHeaders,
  });
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
