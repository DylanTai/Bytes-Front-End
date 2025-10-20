import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import * as recipeService from "../../services/RecipeService.js";
import "./RecipeDetail.css";

// format date to show only day, not time
const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

function RecipeDetail() {
  const params = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState({
    emotion: "",
    physical: "",
    intensity: 5,
    timeOfEmotion: formatDate(new Date()),
    comments: { note: "" },
  });
  const [editRecipe, setEditRecipe] = useState({
    emotion: "",
    physical: "",
    intensity: 5,
    timeOfEmotion: formatDate(new Date()),
    comments: { note: "" },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getCurrentRecipe = async () => {
      const recipe = await recipeService.getRecipe(params.recipeId);
      setRecipe(recipe);
    };
    getCurrentRecipe();
  }, []);

  // handle submit function
  const handleSubmit = async (event) => {
    event.preventDefault();

      if (!editRecipe.physical || !editRecipe.emotion) {
      alert("Please complete the form before submitting!");
      return;
    }

  try {
      const updated = await recipeService.updateRecipe(editRecipe);
  
      if (!updated) {
        setError("There was an error, try again");
      } else {
        setRecipe(updated);
        setIsEditing(false);
      }
  } catch (error) {
    
  }
  };

  // handle delete function
  const handleDelete = async (event) => {
    event.preventDefault();

    if (!window.confirm("Are you sure you want to delete this Recipeie?")) return;

    const deleteRecipe = await recipeService.deleteRecipe(recipe._id);
    if (!deleteRecipe) {
      setError("There was an error, please try again!");
    } else {
      setIsEditing(false);
      navigate("/");
    }
  };

  const recipeIsLoaded = (checkRecipe) => {
    return checkRecipe && checkRecipe._id;
  };

  return (
    <>
      {!isEditing ? (
        recipeIsLoaded(recipe) ? (
          <div className="recipe-detail">
            <h1 className="recipe-detail-title">{recipe.emotion}</h1>
            <p>{error}</p>

            <p className="recipe-element">
              Day of Recipe:{" "}
              {recipe.timeOfEmotion
                ? formatDate(new Date(recipe.timeOfEmotion))
                : ""}
            </p>
            <p className="recipe-element">Physical Experience: {recipe.physical}</p>
            <p className="recipe-element">Intensity of Recipe: {recipe.intensity}</p>
            {recipe.comments?.note && <p>Note: {recipe.comments.note}</p>}

            <div className="buttons">
              <button
                type="button"
                onClick={() => {
                  setEditRecipe(recipe);
                  setIsEditing(true);
                }}
              >
                Edit Recipe
              </button>
              <button type="button" onClick={handleDelete}>
                Remove Recipe
              </button>
            </div>
          </div>
        ) : (
          <h3>Loading...</h3>
        )
      ) : recipeIsLoaded(editRecipe) ? (
        <form onSubmit={handleSubmit} className="update-recipeform">
          <h1 className="edit-recipe-detail-title">Update {editRecipe.emotion}</h1>

          {/* emotion edit */}
          <div className="form-element">
            <label>Recipe: </label>
            <select
              value={editRecipe.emotion}
              onChange={(event) =>
                setEditRecipe({ ...editRecipe, emotion: event.target.value })
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

           
          {/* time of emotion edit */}
          <div className="form-element">  
          <label>Day of Recipe: </label>
          <input
            type="date"
            value={
              editRecipe.timeOfEmotion
                ? formatDate(new Date(editRecipe.timeOfEmotion))
                : ""
            }
            onChange={(event) =>
              setEditRecipe({ ...editRecipe, timeOfEmotion: event.target.value })
            }
            max={formatDate(new Date())}
            className="time-edit"
          />
          </div> 


          {/* intensity edit */}
          <div className="form-element">
          <label>
            On a scale of 1 to 10, select the intensity of the recipe:{" "}
          </label>
          <select
            value={editRecipe.intensity}
            onChange={(event) =>
              setEditRecipe({
                ...editRecipe,
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

          {/* physical experience edit */}
          <div className="form-element">
          <label>Physical experience of recipe: </label>
          <textarea
            value={editRecipe.physical}
            onChange={(event) =>
              setEditRecipe({ ...editRecipe, physical: event.target.value })
            }
            className="edit-physical"
          />
          </div>

          {/* notes edit */}
          <div className="form-element">
          <label>Note: </label>
          <textarea
            value={editRecipe.comments?.note ?? ""}
            onChange={(event) =>
              setEditRecipe({
                ...editRecipe,
                comments: {
                  ...editRecipe.comments,
                  note: event.target.value,
                },
              })
            }
            className="edit-note"
          />
          </div>

          <div className="buttons">
            <button type="submit">Update Recipe</button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel Update
            </button>
          </div>
        </form>
      ) : (
        <h3>Loading...</h3>
      )}
    </>
  );
}

export default RecipeDetail;
