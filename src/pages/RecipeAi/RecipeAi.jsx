import { useState } from "react";
import { useNavigate } from "react-router";
import { generateRecipe } from "../../services/recipeService.js";
import "./RecipeAI.css";

const RecipeAI = () => {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedRecipe(null);
  };

  const handleAccept = () => {
    // Redirect user to RecipeForm with generated recipe prefilled
    navigate("/recipes/add", { state: { generatedRecipe } });
  };

  return (
    <div className="recipe-ai-container">
      <h2>AI Recipe Generator</h2>
    </div>
  );
};

export default RecipeAI;
