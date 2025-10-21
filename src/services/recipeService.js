const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/recipes/`;

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

// Recipe CRUD Operations
export const getRecipes = async () => {
  try {
    const res = await fetchWithAuth(BASE_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch recipes");
    return await res.json();
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};

export const getRecipe = async (id) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}${id}/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Recipe not found");
      }
      throw new Error("Failed to fetch recipe");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching recipe:", error);
    throw error;
  }
};

export const addRecipe = async (recipeData) => {
  try {
    const isFormData = recipeData instanceof FormData;
    const res = await fetchWithAuth(BASE_URL, {
      method: "POST",
      body: isFormData ? recipeData : JSON.stringify(recipeData),
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to create recipe");
    return await res.json();
  } catch (error) {
    console.error("Error creating recipe:", error);
    throw error;
  }
};

export const updateRecipe = async (id, recipeData) => {
  try {
    const isFormData = recipeData instanceof FormData;
    const res = await fetchWithAuth(`${BASE_URL}${id}/`, {
      method: "PUT",
      body: isFormData ? recipeData : JSON.stringify(recipeData),
      headers: isFormData ? {} : { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to update recipe");
    return await res.json();
  } catch (error) {
    console.error("Error updating recipe:", error);
    throw error;
  }
};

export const deleteRecipe = async (id) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
    // Django returns 204 No Content
    if (res.status === 204) {
      return { success: true };
    } else if (!res.ok) {
      throw new Error("Failed to delete recipe");
    } else {
      return await res.json();
    }
  } catch (error) {
    console.error("Error deleting recipe:", error);
    throw error;
  }
};

// Ingredient and Step API Utilities
export const getIngredients = async (recipeId) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}${recipeId}/ingredients/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch ingredients");
    return await res.json();
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    throw error;
  }
};

export const addIngredient = async (recipeId, ingredientData) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}${recipeId}/ingredients/`, {
      method: "POST",
      body: JSON.stringify(ingredientData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to add ingredient");
    return await res.json();
  } catch (error) {
    console.error("Error adding ingredient:", error);
    throw error;
  }
};

export const updateIngredient = async (
  recipeId,
  ingredientId,
  ingredientData
) => {
  const res = await fetchWithAuth(
    `${BASE_URL}${recipeId}/ingredients/${ingredientId}/`,
    {
      method: "PUT",
      body: JSON.stringify(ingredientData),
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!res.ok) throw new Error("Failed to update ingredient");
  return await res.json();
};

export const deleteIngredient = async (recipeId, ingredientId) => {
  const res = await fetchWithAuth(
    `${BASE_URL}${recipeId}/ingredients/${ingredientId}/`,
    {
      method: "DELETE",
    }
  );
  if (res.status === 204) return { success: true };
  if (!res.ok) throw new Error("Failed to delete ingredient");
};

export const getSteps = async (recipeId) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}${recipeId}/steps/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch steps");
    return await res.json();
  } catch (error) {
    console.error("Error fetching steps:", error);
    throw error;
  }
};

export const updateStep = async (recipeId, stepData, stepId) => {
  try {
    const isFormData = stepData instanceof FormData;
    const res = await fetchWithAuth(`${BASE_URL}${recipeId}/steps/${stepId}/`, {
      method: "PUT",
      body: isFormData ? stepData : JSON(stepData),
      headers: isFormData ? {} : { "Content-type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to update step");
    return await res.json();
  } catch (error) {
    console.error("Error updating the step");
  }
};

export const addStep = async (recipeId, stepData) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}${recipeId}/steps/`, {
      method: "POST",
      body: JSON.stringify(stepData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to add step");
    return await res.json();
  } catch (error) {
    console.error("Error adding step:", error);
    throw error;
  }
};
