const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/users`;

export const index = async () => {
  try {
    const accessToken = localStorage.getItem("access");
    if (!accessToken) throw new Error("No access token found.");

    const res = await fetch(BASE_URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch users.");

    return await res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
