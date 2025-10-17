import api from "./apiConfig.js";

export const getCats = async () => {
  try {
    const response = await api.get("/cats/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCat = async (id) => {
  try {
    const response = await api.get(`/cats/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCat = async (catData) => {
  try {
    const response = await api.post("/cats/", catData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCat = async (id, catData) => {
  try {
    const response = await api.put(`/cats/${id}/`, catData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCat = async (id) => {
  try {
    const response = await api.delete(`/cats/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToyForCat = async (catId, toyId) => {
  try {
    const response = await api.post(`cats/${catId}/add_toy/${toyId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeToyFromCat = async (catId, toyId) => {
  try {
    const response = await api.post(`cats/${catId}/remove_toy/${toyId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
