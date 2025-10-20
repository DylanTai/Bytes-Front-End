import { useState, useEffect } from "react";
import { Link } from "react-router";
import * as recipeService from "../../services/recipeService.js";
import "./RecipeList.css";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date) ? "Unknown date" : date.toISOString().split("T")[0];
};

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("Newest"); // default sort
  const recipesPerPage = 5;

  // Fetch recipes on mount
  useEffect(() => {
    const fetchRecipes = async () => {
      const data = await recipeService.getRecipes();
      setRecipes(Array.isArray(data) ? data : []);
    };
    fetchRecipes();
  }, []);

  // Sorting logic
  const sortedRecipes = [...recipes].sort((a, b) => {
    switch (sortBy) {
      case "Newest":
        return b.id - a.id; // assuming higher ID = newer
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

  // Pagination logic
  const currRecipes = sortedRecipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  );
  const pages = Math.ceil(sortedRecipes.length / recipesPerPage);

  return (
    <div className="recipe-list-page">
      <h1 className="recipe-list-title">My Recipes</h1>

      <div className="sort-controls">
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="Newest">Posted (Newest)</option>
          <option value="Oldest">Posted (Oldest)</option>
          <option value="Title (A-Z)">Title (A → Z)</option>
          <option value="Title (Z-A)">Title (Z → A)</option>
        </select>
      </div>

      <br />

      {currRecipes.length === 0 ? (
        <p>You have no recipes yet.</p>
      ) : (
        <ul className="recipe-list">
          {currRecipes.map((recipe) => (
            <Link
              to={`/recipes/${recipe.id}`}
              className="recipe-link"
              key={recipe.id}
            >
              <li className="recipe-card">
                <strong>{recipe.title}</strong>
                {recipe.favorite && <span> 🍪 </span>}
              </li>
            </Link>
          ))}
        </ul>
      )}

      <div className="recipe-list-buttons">
        <Link to="/add" className="add-button">
          <button>Add Recipe</button>
        </Link>

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
