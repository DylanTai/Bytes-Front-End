
import api from "./apiConfig";

export const getRecipes = async () => {
  const { data } = await api.get("/recipes/");
  return data;
};

export const getRecipe = async (id) => {
  const { data } = await api.get(`/recipes/${id}/`);
  return data;
};

export const createRecipe = async (recipe) => {
  const { data } = await api.post("/recipes/", recipe);
  return data;
};

export const updateRecipe = async (id, recipe) => {
  const { data } = await api.put(`/recipes/${id}/`, recipe);
  return data;
};

export const deleteRecipe = async (id) => {
  await api.delete(`/recipes/${id}/`);
};
