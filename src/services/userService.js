const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/users`;

// Helper function for authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const access = localStorage.getItem("access");

  const authHeaders = {
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

export const getUser = async () => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}/token/refresh/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
