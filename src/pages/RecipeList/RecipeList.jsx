import { useState, useEffect } from "react";
import { Link } from "react-router";
import * as recipeService from "../../services/recipeService.js";
import * as groceryListService from "../../services/groceryListService.js";
import "./RecipeList.css";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesFirst, setShowFavoritesFirst] = useState(false);
  const recipesPerPage = 5;

  useEffect(() => {
    const fetchRecipes = async () => {
      const data = await recipeService.getRecipes();
      setRecipes(Array.isArray(data) ? data : []);
    };
    fetchRecipes();
  }, []);

  const handleAddToGroceryList = async (e, recipeId, recipeTitle) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Import conversion utilities
      const { areUnitsCompatible, convertQuantity, findOptimalUnit } = 
        await import("../../config/recipeConfig.js");
      
      // Fetch current grocery list and recipe details
      const [currentItems, recipe] = await Promise.all([
        groceryListService.getGroceryList(),
        recipeService.getRecipe(recipeId)
      ]);
      
      let addedCount = 0;
      let updatedCount = 0;
      
      // Process each ingredient
      for (const ingredient of recipe.ingredients) {
        // Find existing item with same name (case-insensitive)
        const existingItem = currentItems.find(
          item => item.name.toLowerCase() === ingredient.name.toLowerCase()
        );
        
        if (existingItem) {
          const ingredientUnit = ingredient.volume_unit || ingredient.weight_unit;
          const existingUnit = existingItem.volume_unit || existingItem.weight_unit;
          
          // Check if both have units and if they're compatible (both volume or both weight)
          if (ingredientUnit && existingUnit && areUnitsCompatible(ingredientUnit, existingUnit)) {
            const isVolume = !!ingredient.volume_unit;
            
            // Convert ingredient quantity to existing item's unit
            const convertedQuantity = convertQuantity(
              ingredient.quantity,
              ingredientUnit,
              existingUnit,
              isVolume
            );
            
            // Add quantities together
            const totalQuantity = existingItem.quantity + convertedQuantity;
            
            // Find optimal unit for display (closest to 1 but >= 1)
            const optimal = findOptimalUnit(totalQuantity, existingUnit, isVolume);
            
            // Update the existing item with new quantity and optimal unit
            await groceryListService.updateGroceryItem(
              existingItem.id, 
              false, // Uncheck when adding more
              {
                quantity: optimal.quantity,
                volume_unit: isVolume ? optimal.unit : '',
                weight_unit: isVolume ? '' : optimal.unit
              }
            );
            
            updatedCount++;
            continue; // Skip adding as new item
          }

          // Neither matching item has any unit (simple count)
          if (!ingredientUnit && !existingUnit) {
            const totalQuantity = existingItem.quantity + ingredient.quantity;

            await groceryListService.updateGroceryItem(
              existingItem.id,
              false,
              {
                quantity: totalQuantity,
                volume_unit: "",
                weight_unit: "",
              }
            );

            updatedCount++;
            continue; // Skip adding as new item
          }
        }
        
        // If no match found or units are incompatible, add as new item
        await groceryListService.addGroceryItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          volume_unit: ingredient.volume_unit || '',
          weight_unit: ingredient.weight_unit || '',
          checked: false
        });
        
        addedCount++;
      }
      
      // Build success message
      const messages = [];
      if (addedCount > 0) {
        messages.push(`Added ${addedCount} new ingredient${addedCount !== 1 ? 's' : ''}`);
      }
      if (updatedCount > 0) {
        messages.push(`Updated ${updatedCount} existing ingredient${updatedCount !== 1 ? 's' : ''}`);
      }
      
      alert(messages.join(' and ') + ` from "${recipeTitle}"`);
      
    } catch (err) {
      console.error("Error adding to grocery list:", err);
      alert("Failed to add ingredients to grocery list.");
    }
  };

  // Search filter
  const searchFilteredRecipes = recipes.filter((recipe) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    // Search in title
    if (recipe.title.toLowerCase().includes(query)) return true;

    // Search in ingredients
    if (recipe.ingredients && recipe.ingredients.some(
      (ingredient) => ingredient.name.toLowerCase().includes(query)
    )) return true;

    // Search in steps
    if (recipe.steps && recipe.steps.some(
      (step) => step.description.toLowerCase().includes(query)
    )) return true;

    return false;
  });

  // Sort recipes
  const sortedRecipes = [...searchFilteredRecipes].sort((a, b) => {
    // Apply favorites filter first if enabled
    if (showFavoritesFirst) {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
    }

    // Then apply regular sorting
    switch (sortBy) {
      case "Newest":
        return b.id - a.id;
      case "Oldest":
        return a.id - b.id;
      case "Title (A-Z)":
        return a.title.localeCompare(b.title);
      case "Title (Z-A)":
        return b.title.localeCompare(a.title);
      default:
        return b.id - a.id;
    }
  });

  // Pagination
  const currRecipes = sortedRecipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  );

  const pages = Math.ceil(sortedRecipes.length / recipesPerPage);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, showFavoritesFirst]);

  return (
    <div className="recipe-list-page">
      <h1 className="recipe-list-title">My Recipes</h1>

      <div className="list-filters">
        {/* Search Bar */}
        <div className="search-bar">
          <label>Search: </label>
          <input
            type="text"
            placeholder="Search recipes, ingredients, or steps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="clear-search-btn"
            >
              ✕
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="favorites-filter">
          <label className="fav-label">
            <input
              type="checkbox"
              checked={showFavoritesFirst}
              onChange={(e) => setShowFavoritesFirst(e.target.checked)}
              className="show-favorite-btn"
            />
            Show 🍪 favorites first
          </label>
        </div>
        <div className="controls">
          <div className="sort-controls">
            <label>Sort by: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="Newest">Posted (Newest)</option>
              <option value="Oldest">Posted (Oldest)</option>
              <option value="Title (A-Z)">Title (A → Z)</option>
              <option value="Title (Z-A)">Title (Z → A)</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="search-results-count">
            Found {sortedRecipes.length} recipe{sortedRecipes.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Recipe List */}
      {currRecipes.length === 0 ? (
        <p className="no-recipes-message">
          {searchQuery ? "No recipes match your search." : "You have no recipes yet."}
        </p>
      ) : (
        <ul className="recipe-list">
          {currRecipes.map((recipe) => (
            <li key={recipe.id} className="recipe-card-wrapper">
              <Link to={`/recipes/${recipe.id}`} className="recipe-link">
                <div className="recipe-card">
                  {/* Optional: Show thumbnail - S3 returns full URL */}
                  {recipe.image ? (
                    <>
                      <div className="recipe-thumbnail-wrapper">
                        <img 
                          src={recipe.image}
                          alt={recipe.title}
                          className="recipe-thumbnail"
                        />
                      </div>
                      <div className="recipe-card-content">
                        <strong>{recipe.title}</strong>
                        {recipe.favorite && <span className="recipe-favorite-icon">🍪</span>}
                      </div>
                    </>
                  ) : (
                    <div className="recipe-thumbnail-wrapper placeholder">
                      <div className="recipe-card-content placeholder-content">
                        <strong>{recipe.title}</strong>
                        {recipe.favorite && <span className="recipe-favorite-icon">🍪</span>}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
              <button
                className="add-ingredients-btn"
                onClick={(e) => handleAddToGroceryList(e, recipe.id, recipe.title)}
              >
                Add to Grocery List
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="recipe-list-buttons">
        {pages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {pages}
            </span>
            <button
              disabled={currentPage === pages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;
