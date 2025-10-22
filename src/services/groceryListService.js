const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/grocery-list`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getGroceryList = async () => {
  try {
    const res = await fetch(`${BASE_URL}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch grocery list");
    return await res.json();
  } catch (err) {
    console.error("Error fetching grocery list:", err);
    throw err;
  }
};

export const addRecipeToGroceryList = async (recipeId) => {
  try {
    const res = await fetch(`${BASE_URL}/add-recipe/${recipeId}/`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to add ingredients");
    return await res.json();
  } catch (err) {
    console.error("Error adding recipe to grocery list:", err);
    throw err;
  }
};

export const updateGroceryItem = async (itemId, checked, additionalData = {}) => {
  try {
    const res = await fetch(`${BASE_URL}/item/${itemId}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ checked, ...additionalData }),
    });
    if (!res.ok) throw new Error("Failed to update item");
    return await res.json();
  } catch (err) {
    console.error("Error updating grocery item:", err);
    throw err;
  }
};

export const addGroceryItem = async (itemData) => {
  try {
    const res = await fetch(`${BASE_URL}/add-item/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
    if (!res.ok) throw new Error("Failed to add grocery item");
    return await res.json();
  } catch (err) {
    console.error("Error adding grocery item:", err);
    throw err;
  }
};

export const clearCheckedItems = async () => {
  try {
    const res = await fetch(`${BASE_URL}/clear-checked/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to clear items");
    return await res.json();
  } catch (err) {
    console.error("Error clearing checked items:", err);
    throw err;
  }
};