import api from './apiConfig.js'

export const getToys = async () => {
  try {
    const response = await api.get("/toys/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getToy = async (id) => {
  try {
    const response = await api.get(`/toys/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createToy = async (toyData) => {
  try {
    const response = await api.post("/toys/", toyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateToy = async (id, toyData) => {
  try {
    const response = await api.put(`/toys/${id}/`, toyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteToy = async (id) => {
  try {
    const response = await api.delete(`/toys/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};