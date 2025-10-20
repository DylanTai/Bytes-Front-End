import { useState } from "react";
import { useNavigate } from "react-router";

import { addRecipe } from "../../services/recipeService.js";
import "./RecipeForm.css";

const RecipeForm = ({ recipes, setRecipes }) => {
  const navigate = useNavigate();

  // format date to show only day, not time
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const [recipeData, setRecipeData] = useState({
    emotion: "",
    physical: "",
    intensity: 5,
    timeOfEmotion: formatDate(new Date()),
    comments: { note: "" },
  });

  // handleSubmit function
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!recipeData.physical || !recipeData.emotion) {
      alert("Please complete the form before submitting!");
      return;
    }

    try {
      const recipeRequest = await addRecipe(recipeData);

      if (recipes) setRecipes([...recipes, recipeRequest]);
      else setRecipes([recipeRequest]);
      setRecipeData({
        emotion: "",
        physical: "",
        intensity: 5,
        timeOfEmotion: formatDate(new Date()),
        comments: { note: "" },
      });
      navigate("/");
    } catch (error) {}
  };

  return (
    <>
      <h1 className="recipeform-title">Log New Recipe</h1>

      <form onSubmit={handleSubmit} className="recipe-form">
        {/* emotion input */}
        <div className="form-element">
          <label>Recipe: </label>
          <select
            value={recipeData.emotion}
            onChange={(event) =>
              setRecipeData({ ...recipeData, emotion: event.target.value })
            }
          >
            <option value=""></option>
            <option value="Angry">Angry</option>
            <option value="Anxious">Anxious</option>
            <option value="Disgusted">Disgusted</option>
            <option value="Happy">Happy</option>
            <option value="Sad">Sad</option>
            <option value="Scared">Scared</option>
            <option value="Surprised">Surprised</option>
          </select>
        </div>

        {/* time of emotion input */}
        <div className="form-element">
          <label>Day of Recipe: </label>
          <input
            type="date"
            value={recipeData.timeOfEmotion}
            onChange={(event) => {
              setRecipeData({
                ...recipeData,
                timeOfEmotion: event.target.value,
              });
            }}
            max={formatDate(new Date())}
            className="time-input"
          />
        </div>

        {/* intensity input */}
        <div className="form-element">
          <label className="intensity-label">
            On a scale of 1 to 10, the intensity of the recipe:
          </label>
          <select
            value={recipeData.intensity}
            onChange={(event) =>
              setRecipeData({
                ...recipeData,
                intensity: parseInt(event.target.value),
              })
            }
          >
            <option value="">--</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </div>

        {/* physical emotional experience input */}
        <div className="form-element">
          <label className="physical-label">
            Physical experience of recipe:{" "}
          </label>
          <textarea
            value={recipeData.physical}
            onChange={(event) =>
              setRecipeData({ ...recipeData, physical: event.target.value })
            }
            placeholder="where do you feel this recipe in your body?"
          />
        </div>

        {/* notes input */}
        <div className="form-element">
          <label>Note: </label>
          <textarea
            value={recipeData.comments.note}
            onChange={(event) =>
              setRecipeData({
                ...recipeData,
                comments: { ...recipeData.comments, note: event.target.value },
              })
            }
            placeholder="anything else?"
            className="note-textarea"
          />
        </div>

        <button type="submit">Add Recipe</button>
      </form>
    </>
  );
};

export default RecipeForm;
