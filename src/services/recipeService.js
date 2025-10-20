const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/recipes/`;

// Helper function for authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const access = localStorage.getItem("access"); // Changed from "token" to "access"

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
    return await res.json();
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
};

export const getRecipe = async (id) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}${id}/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Error fetching recipe:", error);
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

    return await res.json();
  } catch (error) {
    console.error("Error creating recipe:", error);
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

    return await res.json();
  } catch (error) {
    console.error("Error updating recipe:", error);
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
    } else {
      return await res.json();
    }
  } catch (error) {
    console.error("Error deleting recipe:", error);
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
    return await res.json();
  } catch (error) {
    console.error("Error fetching ingredients:", error);
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
    return await res.json();
  } catch (error) {
    console.error("Error adding ingredient:", error);
  }
};

export const getSteps = async (recipeId) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}${recipeId}/steps/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Error fetching steps:", error);
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
    return await res.json();
  } catch (error) {
    console.error("Error adding step:", error);
  }
};
