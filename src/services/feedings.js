import api from "./apiConfig.js";

export const getCatFeedings = async (id) => {
  try {
    const response = await api.get(`/cats/${id}/feedings/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addCatFeeding = async (id, feedingData) => {
  try {
    const response = await api.post(`/cats/${id}/feedings/`, feedingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
