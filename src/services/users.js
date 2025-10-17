
import api from "./apiConfig";

export const signUp = async (credentials) => {
  const resp = await api.post("/users/register/", credentials);
  localStorage.setItem("token", resp.data.access);
  return resp.data.user;
};

export const signIn = async (credentials) => {
  const resp = await api.post("/users/login/", credentials);
  localStorage.setItem("token", resp.data.access);
  return resp.data.user;
};

export const signOut = async () => {
  localStorage.removeItem("token");
  return true;
};

export const verifyUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const resp = await api.get("/users/token/refresh/");
    localStorage.setItem("token", resp.data.access);
    return resp.data.user;
  } catch {
    localStorage.removeItem("token");
    return false;
  }
};
