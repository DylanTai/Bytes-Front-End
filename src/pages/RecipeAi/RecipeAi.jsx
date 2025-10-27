import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { generateRecipe } from "../../services/recipeService.js";
import {
  AVAILABLE_TAGS_AI,
  formatTagLabel,
} from "../../config/recipeConfig.js";
import "./RecipeAI.css";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";
import { showToast } from "../../components/PopUps/PopUps.jsx";

import {
  addRecipe,
  addIngredient,
  addStep,
} from "../../services/recipeService.js";

const RecipeAI = () => {
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [useGroceryList, setUseGroceryList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tagOptions = useMemo(
    () => [...AVAILABLE_TAGS_AI].sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowLoading(true), 300);
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handlePromptChange = (e) => setPrompt(e.target.value);

  const handleTagChange = (tagValue) => {
    setTags((prev) =>
      prev.includes(tagValue)
        ? prev.filter((t) => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setGeneratedRecipe(null);

    try {
      const response = await generateRecipe(prompt, tags);
      const responseTags = response.tags || [];
      setGeneratedRecipe({
        title: response.title,
        notes: response.notes || "",
        ingredients: response.ingredients || [],
        steps: response.steps || [],
        tags: responseTags,
      });

      // update checkboxes to reflect AI tags
      const validTagValues = new Set(AVAILABLE_TAGS_AI.map((tag) => tag.value));
      const normalizedTags = responseTags.filter((tag) =>
        validTagValues.has(tag)
      );
      if (normalizedTags.length > 0) {
        setTags((prev) => {
          const prevList = Array.isArray(prev) ? prev : [];
          const tagSet = new Set(prevList);
          normalizedTags.forEach((tag) => tagSet.add(tag));
          return Array.from(tagSet);
        });
      }
    } catch (err) {
      setError("Failed to generate recipe. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSave = async (event) => {
    event.preventDefault();
    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append("title", generatedRecipe.title);
      formData.append("notes", generatedRecipe.notes);
      const tagsToSave = generatedRecipe.tags?.length
        ? generatedRecipe.tags
        : tags;
      formData.append("tags", JSON.stringify(tagsToSave));

      const newRecipe = await addRecipe(formData);

      // Create Ingredients for the newly created Recipe
      const ingredientsPromises = generatedRecipe.ingredients.map(
        (ingredient) =>
          addIngredient(newRecipe.id, {
            ...ingredient,
            recipe: newRecipe.id,
          })
      );
      await Promise.all(ingredientsPromises);

      // Create Steps for the newly created Recipe
      const stepsPromises = generatedRecipe.steps.map((step) =>
        addStep(newRecipe.id, {
          ...step,
          recipe: newRecipe.id,
        })
      );
      await Promise.all(stepsPromises);
      navigate(`/recipes/${newRecipe.id}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      // Handle different types of errors
      if (error.status === 400) {
        // Validation error - don't redirect to sign-in
        const details = error.details;
        let errorMessage = "Please check your recipe data:\n";

        if (details && typeof details === "object") {
          // Format validation errors
          Object.entries(details).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessage += `\n${field}: ${messages.join(", ")}`;
            }
          });
        } else {
          errorMessage = "Invalid recipe data. Please check all fields.";
        }

        showToast(errorMessage, "error");
      } else if (error.status === 401) {
        // Authentication error - redirect to sign-in
        showToast("Your session has expired. Please log in again.", "error");
        navigate("/sign-in");
      } else {
        // Other errors
        showToast(`An error occurred: ${error.message}`, "error");
      }
    }
  };

  return (
    <div className="prompt-form-page">
      <h2 className="AI-form-title">AI Recipe Generator</h2>

      <form onSubmit={handleSubmit} className="prompt-form">
        <div className="ai-form-container">
          <div className="prompt-box">
            <label htmlFor="prompt-input">Enter your input:</label>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="e.g. healthy high-protein breakfast"
              required
              rows="4"
            />
          </div>

          <div className="ai-form-container">
            <div className="grocery-list-checkbox">
              <label htmlFor="grocery-lisst-checkbox">
                <input
                  type="checkbox"
                  checked={useGroceryList}
                  onChange={(e) => setUseGroceryList(e.target.checked)}
                />
                Use items that I checked on my grocery list
              </label>
            </div>
          </div>

          <div className="tags-container">
            <h3>Tags</h3>
            <div className="tags-grid">
              {tagOptions.map((tag) => (
                <label key={tag.value} className="tag-checkbox">
                  <input
                    type="checkbox"
                    checked={tags.includes(tag.value)}
                    onChange={() => handleTagChange(tag.value)}
                  />
                  {tag.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          className="generate-buttons"
          id="generate-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Recipe"}
        </button>
      </form>

      <div className="response">
        {error && <p className="error-message">{error}</p>}

        {showLoading && (
          <div className="loading-container">
            <LoadingAnimation />
          </div>
        )}

        {generatedRecipe && !loading && (
          <div className="response-recipe">
            <h2 id="recipe-title">{generatedRecipe.title}</h2>

            {generatedRecipe.notes && (
              <div className="generated-recipe-notes">
                <h3>Notes:</h3>
                <p>{generatedRecipe.notes}</p>
              </div>
            )}

            {generatedRecipe.tags?.length > 0 && (
              <div className="generated-tags">
                <h3>Tags</h3>
                <ul className="generated-tags-list">
                  {generatedRecipe.tags.map((tag, index) => (
                    <li key={`${tag}-${index}`}>{formatTagLabel(tag)}</li>
                  ))}
                </ul>
              </div>
            )}

            {generatedRecipe.ingredients?.length > 0 && (
              <div className="generated-ingredients">
                <h3>Ingredients</h3>
                <ul className="generated-ingredient-list">
                  {generatedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="generated-ingredient-item">
                      {ing.quantity && <>{ing.quantity} </>}
                      {ing.volume_unit || ing.weight_unit
                        ? `${ing.volume_unit || ing.weight_unit} `
                        : ""}
                      {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {generatedRecipe.steps?.length > 0 && (
              <div className="generated-steps">
                <h3>Steps</h3>
                <ol className="generated-step-list">
                  {generatedRecipe.steps
                    .sort((a, b) => (a.step || 0) - (b.step || 0))
                    .map((step, idx) => (
                      <li key={idx}>{step.description}</li>
                    ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
      {generatedRecipe && !loading && (
        <>
          <div className="ai-disclaimer-box">
            DISCLAIMER: AI may mislabel dietary tags or ingredients. Always
            double-check ingredients and allergens before cooking.
          </div>
          <button
            className="generate-buttons"
            id="save-button"
            onClick={handleSubmitSave}
          >
            Save recipe!
          </button>
        </>
      )}
    </div>
  );
};

export default RecipeAI;
