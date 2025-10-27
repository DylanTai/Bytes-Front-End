import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import * as recipeService from "../../services/recipeService.js";
import * as groceryListService from "../../services/groceryListService.js";
import { AVAILABLE_TAGS } from "../../config/recipeConfig.js";
import "./RecipeList.css";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("Newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesFirst, setShowFavoritesFirst] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const recipesPerPage = 14;

  const sortedAvailableTags = useMemo(() => {
    return [...AVAILABLE_TAGS].sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await recipeService.getRecipes();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, showFavoritesFirst, selectedTags]);

  const handleAddToGroceryList = async (e, recipeId, recipeTitle) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await groceryListService.addRecipeToGroceryList(
        recipeId
      );
      const message =
        response?.message ||
        `Added ingredients from "${recipeTitle}" to your grocery list.`;
      alert(message);
    } catch (err) {
      console.error("Error adding to grocery list:", err);
      alert("Failed to add ingredients to grocery list.");
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  // Search filter
  const searchFilteredRecipes = recipes.filter((recipe) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.trim().toLowerCase();

    // Search in title
    if (recipe.title.toLowerCase().includes(query)) return true;

    // Search in ingredients
    if (
      recipe.ingredients &&
      recipe.ingredients.some((ingredient) =>
        ingredient.name.toLowerCase().includes(query)
      )
    )
      return true;

    // Search in steps
    if (
      recipe.steps &&
      recipe.steps.some((step) =>
        step.description.toLowerCase().includes(query)
      )
    )
      return true;

    return false;
  });

  // Tag filter
  const tagFilteredRecipes = searchFilteredRecipes.filter((recipe) => {
    if (selectedTags.length === 0) return true;
    if (!Array.isArray(recipe.tags) || recipe.tags.length === 0) return false;
    return selectedTags.every((tag) => recipe.tags.includes(tag));
  });

  // Sort recipes
  const sortedRecipes = [...tagFilteredRecipes].sort((a, b) => {
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

        <div className={`filter-panel ${showFilters ? "open" : ""}`}>
          <button
            type="button"
            className="filter-toggle-btn"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            Filters {showFilters ? "▲" : "▼"}
          </button>
          {showFilters && (
            <div className="filter-content">
              <div className="filter-header">
                <div className="controls sort-controls">
                  <label>Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Newest">Posted (Newest)</option>
                    <option value="Oldest">Posted (Oldest)</option>
                    <option value="Title (A-Z)">Title (A → Z)</option>
                    <option value="Title (Z-A)">Title (Z → A)</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={() => {
                    setSortBy("Newest");
                    setShowFavoritesFirst(false);
                    setSelectedTags([]);
                  }}
                >
                  Reset All Filters
                </button>
              </div>

              <div className="filters-check-panel">
                <div className="filters-check-grid">
                  <label className="filters-check-item">
                    <input
                      className="filters-check-checkbox"
                      type="checkbox"
                      checked={showFavoritesFirst}
                      onChange={(e) => setShowFavoritesFirst(e.target.checked)}
                    />
                    <span className="filters-check-label">
                      Show favorites first 🍪
                    </span>
                  </label>
                  {sortedAvailableTags.map((tag) => (
                    <label key={tag.value} className="filters-check-item">
                      <input
                        className="filters-check-checkbox"
                        type="checkbox"
                        value={tag.value}
                        checked={selectedTags.includes(tag.value)}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          setSelectedTags((prev) =>
                            checked
                              ? [...prev, value]
                              : prev.filter((tagValue) => tagValue !== value)
                          );
                        }}
                      />
                      <span className="filters-check-label">{tag.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="search-results-count">
            Found {sortedRecipes.length} recipe
            {sortedRecipes.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Recipe List */}
      {currRecipes.length === 0 ? (
        <p className="no-recipes-message">No recipes here!</p>
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
                        {recipe.favorite && (
                          <span className="recipe-favorite-icon">🍪</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="recipe-thumbnail-wrapper placeholder">
                      <div className="recipe-card-content placeholder-content">
                        <strong>{recipe.title}</strong>
                        {recipe.favorite && (
                          <span className="recipe-favorite-icon">🍪</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
              <button
                className="add-ingredients-btn"
                onClick={(e) =>
                  handleAddToGroceryList(e, recipe.id, recipe.title)
                }
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
