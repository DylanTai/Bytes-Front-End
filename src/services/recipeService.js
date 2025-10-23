const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/recipes/`;

// Decode JWT to check expiration
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // Check if token expires in less than 1 minute
    return expirationTime - currentTime < 60000;
  } catch (error) {
    return true;
  }
};

// Refresh the access token
const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_END_SERVER_URL}/users/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("access", data.access);
      return data.access;
    } else {
      // Refresh token is invalid
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/sign-in";
      throw new Error("Refresh token invalid");
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/sign-in";
    throw error;
  }
};

// Helper function for authenticated requests with proactive token refresh
const fetchWithAuth = async (url, options = {}) => {
  let access = localStorage.getItem("access");

  // Check if token is expired or about to expire
  if (isTokenExpired(access)) {
    try {
      access = await refreshAccessToken();
    } catch (error) {
      // If refresh fails, redirect happens in refreshAccessToken
      throw error;
    }
  }

  // Build headers without mutating original options
  const authHeaders = {
    ...options.headers,
  };

  if (access) {
    authHeaders["Authorization"] = `Bearer ${access}`;
  }

  // Make the request with auth headers
  let response = await fetch(url, {
    ...options,
    headers: authHeaders,
  });

  // If still unauthorized after refresh attempt, try one more time
  if (response.status === 401) {
    const refresh = localStorage.getItem("refresh");
    if (refresh) {
      try {
        access = await refreshAccessToken();

        // Retry original request with new token
        // Important: Pass the original options again (body is still intact)
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${access}`,
          },
        });
      } catch (error) {
        console.error("Token refresh failed:", error);
        // Redirect happens in refreshAccessToken
      }
    } else {
      // No refresh token available
      localStorage.removeItem("access");
      window.location.href = "/sign-in";
    }
  }

  return response;
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

    if (!res.ok) {
      // Get error details from response
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 400) {
        // Validation error
        const error = new Error("Validation failed");
        error.status = 400;
        error.details = errorData;
        throw error;
      } else if (res.status === 401) {
        // Authentication error
        const error = new Error("Authentication failed");
        error.status = 401;
        throw error;
      } else {
        // Other error
        throw new Error("Failed to create recipe");
      }
    }

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
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 400) {
        const error = new Error("Validation failed");
        error.status = 400;
        error.details = errorData;
        throw error;
      } else if (res.status === 401) {
        const error = new Error("Authentication failed");
        error.status = 401;
        throw error;
      }

      throw new Error("Failed to update recipe");
    }
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
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 400) {
        const error = new Error("Validation failed");
        error.status = 400;
        error.details = errorData;
        throw error;
      } else if (res.status === 401) {
        const error = new Error("Authentication failed");
        error.status = 401;
        throw error;
      }

      throw new Error("Failed to add ingredient");
    }
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
  try {
    const res = await fetchWithAuth(
      `${BASE_URL}${recipeId}/ingredients/${ingredientId}/`,
      {
        method: "PUT",
        body: JSON.stringify(ingredientData),
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 400) {
        const error = new Error("Validation failed");
        error.status = 400;
        error.details = errorData;
        throw error;
      } else if (res.status === 401) {
        const error = new Error("Authentication failed");
        error.status = 401;
        throw error;
      }

      throw new Error("Failed to update ingredient");
    }
    return await res.json();
  } catch (error) {
    console.error("Error updating ingredient:", error);
    throw error;
  }
};

export const updateStep = async (recipeId, stepId, stepData) => {
  try {
    // const isFormData = stepData instanceof FormData;
    const res = await fetchWithAuth(`${BASE_URL}${recipeId}/steps/${stepId}/`, {
      method: "PUT",
      body: JSON.stringify(stepData),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 400) {
        const error = new Error("Validation failed");
        error.status = 400;
        error.details = errorData;
        throw error;
      } else if (res.status === 401) {
        const error = new Error("Authentication failed");
        error.status = 401;
        throw error;
      }

      throw new Error("Failed to update step");
    }
    return await res.json();
  } catch (error) {
    console.error("Error updating the step", error);
    throw error;
  }
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

export const addStep = async (recipeId, stepData) => {
  try {
    const res = await fetchWithAuth(`${BASE_URL}${recipeId}/steps/`, {
      method: "POST",
      body: JSON.stringify(stepData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (res.status === 400) {
        const error = new Error("Validation failed");
        error.status = 400;
        error.details = errorData;
        throw error;
      } else if (res.status === 401) {
        const error = new Error("Authentication failed");
        error.status = 401;
        throw error;
      }

      throw new Error("Failed to add step");
    }
    return await res.json();
  } catch (error) {
    console.error("Error adding step:", error);
    throw error;
  }
};

export const deleteStep = async (recipeId, stepId) => {
  const res = await fetchWithAuth(`${BASE_URL}${recipeId}/steps/${stepId}/`, {
    method: "DELETE",
  });
  if (res.status === 204) return { success: true };
  if (!res.ok) throw new Error("Failed to delete step");
};

export async function generateRecipe(prompt, token) {
  const res = await fetch("/api/recipes/generate/", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate recipe");
  }
  return await res.json();
}
