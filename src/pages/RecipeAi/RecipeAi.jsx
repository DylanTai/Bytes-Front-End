// src/pages/RecipeAi/RecipeAi.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { generateRecipe } from "../../services/recipeService.js";
import "./RecipeAi.css";

const RecipeAi = () => {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");
      const recipe = await generateRecipe(prompt);
      setGeneratedRecipe(recipe);
    } catch (err) {
      console.error(err);
      setError("Error generating recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    // Redirect user to RecipeForm with generated recipe prefilled
    navigate("/recipes/add", { state: { generatedRecipe } });
  };

  return (
    <div className="recipe-ai-container">
      <h2>AI Recipe Generator</h2>

      {!generatedRecipe ? (
        <>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you’d like to cook..."
            rows="4"
          />
          <button onClick={handleGenerate} disabled={loading || !prompt}>
            {loading ? "Generating..." : "Generate Recipe"}
          </button>
          {error && <p className="error">{error}</p>}
        </>
      ) : (
        <div className="generated-recipe">
          <h3>{generatedRecipe.title}</h3>
          <p>{generatedRecipe.description}</p>

          <h4>Ingredients</h4>
          <ul>
            {generatedRecipe.ingredients?.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>

          <h4>Steps</h4>
          <ol>
            {generatedRecipe.steps?.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>

          <div className="actions">
            <button onClick={handleAccept}>Accept Recipe</button>
            <button onClick={() => setGeneratedRecipe(null)}>Reject</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeAi;
