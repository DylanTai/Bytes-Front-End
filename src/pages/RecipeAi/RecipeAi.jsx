import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { generateRecipe } from "../../services/recipeService.js";
import { AVAILABLE_TAGS_AI } from "../../config/recipeConfig.js";
import "./RecipeAI.css";

import {
  addRecipe,
  addIngredient,
  addStep,
} from "../../services/recipeService.js";

const RecipeAI = () => {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tagOptions = useMemo(
    () => [...AVAILABLE_TAGS_AI].sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

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

    try {
      const response = await generateRecipe(prompt, tags);
      setGeneratedRecipe(response);
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
      formData.append("tags", JSON.stringify(tags));

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

        alert(errorMessage);
      } else if (error.status === 401) {
        // Authentication error - redirect to sign-in
        alert("Your session has expired. Please log in again.");
        navigate("/sign-in");
      } else {
        // Other errors
        alert(`An error occurred: ${error.message}`);
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
            <input
              type="text"
              id="prompt-input"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="e.g. healthy high-protein breakfast"
              required
            />
          </div>

          <div className="tags-container">
            <h3>Choose tags:</h3>
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

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Recipe"}
        </button>
      </form>

      <div className="response">
        {error && <p className="error-message">{error}</p>}

        {generatedRecipe && !loading && (
          <div className="response-recipe">
            <h2 id="recipe-title">{generatedRecipe.title}</h2>

            {generatedRecipe.notes && (
              <div className="generated-recipe-notes">
                <h3>Notes:</h3>
                <p>{generatedRecipe.notes}</p>
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
      <button onClick={handleSubmitSave}>Save recipe!</button>
    </div>
  );
};

export default RecipeAI;
