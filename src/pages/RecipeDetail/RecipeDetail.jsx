import "./RecipeDetail.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import toast from "react-hot-toast";
import * as recipeService from "../../services/recipeService.js";
import { formatTagLabel } from "../../config/recipeConfig.js";
import * as groceryListService from "../../services/groceryListService.js";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";
import {showToast} from "../../components/PopUps/PopUps.jsx";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState(null);
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingIngredientId, setAddingIngredientId] = useState(null);
  const [favoriteUpdating, setFavoriteUpdating] = useState(false);

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
        showToast("Recipe not found or you don't have permission to view it", "error")
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
        showToast("Recipe deleted!", "success")
        navigate("/");
      } catch (error) {
        console.error("Failed to delete recipe:", error);
        showToast("Failed to delete recipe.", "error")
      }
    }
  };


  const handleAddIngredientToGrocery = async (ingredient) => {
    if (addingIngredientId === ingredient.id) return;
    setAddingIngredientId(ingredient.id);
    try {
      const response = await groceryListService.addGroceryItem({
        name: ingredient.name,
        quantity: ingredient.quantity,
        volume_unit: ingredient.volume_unit || "",
        weight_unit: ingredient.weight_unit || "",
      });
      const message =
        response?.message || `Added ${ingredient.name} to your grocery list.`;
      showToast(message, "success");
    } catch (err) {
      console.error("Failed to add ingredient to grocery list:", err);
      showToast("Failed to add ingredients to grocery list.", "error")
    } finally {
      setAddingIngredientId(null);
    }
  };

  if (loading) {
    return <LoadingAnimation />;
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

          {/* Back button */}
          <div className="recipe-footer">
            <button onClick={() => navigate("/")} className="back-button">
              Back to Recipes
            </button>
          </div>
        </div>
      </div>

      <div className="favorite-container detail-favorite-container">
        <label
          htmlFor="detail-favorite"
          className="detail-favorite-label"
        >
          Favorite 🍪
        </label>
        <input
          id="detail-favorite"
          type="checkbox"
          className="detail-favorite-checkbox"
          checked={!!recipe.favorite}
          onChange={handleFavoriteToggle}
          disabled={favoriteUpdating}
        />
      </div>

      {/* Recipe Image - S3 returns full URL */}
      {recipe.image && (
        <div className="recipe-image-container">
          <img src={recipe.image} alt={recipe.title} className="recipe-image" />
        </div>
      )}

      {/* Tags Section */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="recipe-tags">
          <h2 className="detail-tag-label">Tags: </h2>
          <div className="tags-list">
            {[...recipe.tags]
              .map((value) => ({ value, label: formatTagLabel(value) }))
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((tag, index) => (
                <div key={`${tag.value}-${index}`} className="tag-item">
                  {tag.label}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {recipe.notes && (
        <div className="detail-recipe-notes">
          <h2 className="detail-notes-label">Notes: </h2>
          <p>{recipe.notes}</p>
        </div>
      )}

      {/* Ingredients Section */}
      <div className="recipe-ingredients">
        <h2>Ingredients: </h2>
        {ingredients && ingredients.length > 0 ? (
          <ul className="recipe-ingredient-list">
            {ingredients.map((ingredient) => {
              const unit = ingredient.volume_unit || ingredient.weight_unit;

              return (
                <li key={ingredient.id} className="ingredient-item">
                  <div className="ingredient-details">
                    <span className="ingredient-quantity">
                      {ingredient.quantity}
                    </span>{" "}
                    {unit && <span className="ingredient-unit">{unit}</span>}{" "}
                    <span className="ingredient-name">{ingredient.name}</span>
                  </div>
                  <button
                    type="button"
                    className="ingredient-add-btn"
                    onClick={() => handleAddIngredientToGrocery(ingredient)}
                    disabled={addingIngredientId === ingredient.id}
                  >
                    {addingIngredientId === ingredient.id
                      ? "Adding..."
                      : "Add to Grocery List"}
                  </button>
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
        <h2 className="detail-steps-label">Steps: </h2>
        {steps && steps.length > 0 ? (
          <div className="steps-list">
            {steps
              .sort((a, b) => a.step - b.step)
              .map((step) => (
                <div key={step.id} className="step-item">
                  <span className="step-number">Step {step.step}:</span>
                  <span className="step-description">{step.description}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="empty-message">No steps added yet.</p>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
