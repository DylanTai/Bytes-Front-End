import "./RecipeDetail.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import * as recipeService from "../../services/recipeService.js";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState(null);
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeData = await recipeService.getRecipe(id);
        const ingredientsData = await recipeService.getIngredients(id);
        const stepsData = await recipeService.getSteps(id);
        setRecipe(recipeData);
        setIngredients(ingredientsData);
        setSteps(stepsData);
      } catch (error) {
        console.error("Failed to fetch recipe:", error);
        setError("Recipe not found or you don't have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${recipe.title}"? This action cannot be undone.`
      )
    ) {
      try {
        await recipeService.deleteRecipe(id);
        alert("Recipe deleted successfully!");
        navigate("/");
      } catch (error) {
        console.error("Failed to delete recipe:", error);
        alert("Failed to delete recipe.");
      }
    }
  };

  if (loading) {
    return (
      <div className="recipe-detail-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-detail-error">
        <h2>{error || "Recipe not found"}</h2>
        <button onClick={() => navigate("/")} className="back-button">
          Back to Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      {/* Header with title and buttons */}
      <div className="recipe-header">
        <h1 className="recipe-title">
          {recipe.title}
          {recipe.favorite && <span className="favorite-icon"> 🍪</span>}
        </h1>
        <div className="recipe-actions">
          <Link to={`/recipes/${id}/edit`}>
            <button className="edit-button">Edit</button>
          </Link>
          <button onClick={handleDelete} className="delete-button">
            Delete
          </button>
        </div>
      </div>

      {/* Tags Section */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="recipe-tags">
          <h2>Tags</h2>
          <div className="tags-list">
            {recipe.tags.map((tag, index) => {
              const tagLabel = tag.replace(/_/g, ' ');
              const formattedLabel = tagLabel.charAt(0).toUpperCase() + tagLabel.slice(1);
              
              return (
                <div key={index} className="tag-item">
                  {formattedLabel}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {recipe.notes && (
        <div className="recipe-notes">
          <h2>Notes</h2>
          <p>{recipe.notes}</p>
        </div>
      )}

      {/* Ingredients Section */}
      <div className="recipe-ingredients">
        <h2>Ingredients</h2>
        {ingredients && ingredients.length > 0 ? (
          <ul>
            {ingredients.map((ingredient) => {
              const unit = ingredient.volume_unit || ingredient.weight_unit;
              
              return (
                <li key={ingredient.id} className="ingredient-item">
                  <span className="ingredient-quantity">{ingredient.quantity}</span>
                  {' '}
                  {unit && <span className="ingredient-unit">{unit}</span>}
                  {' '}
                  <span className="ingredient-name">{ingredient.name}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-message">No ingredients added yet.</p>
        )}
      </div>

      {/* Steps Section */}
      <div className="recipe-steps">
        <h2>Steps</h2>
        {steps && steps.length > 0 ? (
          <ol>
            {steps
              .sort((a, b) => a.step - b.step)
              .map((step) => (
                <li key={step.id} className="step-item">
                  <span className="step-description">{step.description}</span>
                </li>
              ))}
          </ol>
        ) : (
          <p className="empty-message">No steps added yet.</p>
        )}
      </div>

      {/* Back button */}
      <div className="recipe-footer">
        <button onClick={() => navigate("/")} className="back-button">
          Back to Recipes
        </button>
      </div>
    </div>
  );
};

export default RecipeDetail;