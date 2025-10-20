const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/users`;

// SIGN UP
export const signUp = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/sign-up/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Sign up failed");
    }

    const data = await res.json();

    // Save JWT tokens for future authenticated requests
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    return data.user; // return the user object
  } catch (err) {
    console.error("Error signing up:", err);
    throw err;
  }
};

// SIGN IN
export const signIn = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/sign-in/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Invalid credentials");
    }

    const data = await res.json();

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    return data.user;
  } catch (err) {
    console.error("Error signing in:", err);
    throw err;
  }
};

// REFRESH TOKEN
export const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("No refresh token found");

  const res = await fetch(`${BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) throw new Error("Token refresh failed");

  const data = await res.json();
  localStorage.setItem("access", data.access);
  return data.access;
};
