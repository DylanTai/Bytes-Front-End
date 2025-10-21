import { useState } from "react";
import { useNavigate } from "react-router";

import {
  addRecipe,
  addIngredient,
  addStep,
} from "../../services/recipeService.js";
import "./RecipeForm.css";

//units
const VOLUME_UNITS = [
  { value: "cup", label: "Cup" },
  { value: "tbsp", label: "Tablespoon" },
  { value: "tsp", label: "Teaspoon" },
];

const WEIGHT_UNITS = [
  { value: "g", label: "Gram" },
  { value: "oz", label: "Ounce" },
];

const RecipeForm = ({ recipes, setRecipes }) => {
  const navigate = useNavigate();

  // useState's
  const [recipeData, setRecipeData] = useState({
    title: "",
    notes: "",
    favorite: false,
  });

  const [ingredientsData, setIngredientsData] = useState([
    {
      name: "",
      quantity: 0,
      volume_unit: "",
      weight_unit: "",
    },
  ]);

  const [stepsData, setStepsData] = useState([
    {
      step: 1,
      description: "",
    },
  ]);

  // button handlers
  const addExtraIngredient = (e) => {
    setIngredientsData((prev) => {
      return [
        ...prev,
        {
          name: "",
          quantity: 0,
          volume_unit: "",
          weight_unit: "",
        },
      ];
    });
  };

  const removeIngredient = (indexToRmove) => {
    setIngredientsData((prev) =>
      prev
        .filter((_, index) => index !== indexToRmove)
        .map((ingredient) => ({
          ...ingredient,
        }))
    );
  };

  const addExtraStep = (e) => {
    setStepsData((prev) => {
      return [
        ...prev,
        {
          step: prev.length + 1,
          description: "",
        },
      ];
    });
  };

  const removeStep = (indexToRmove) => {
    setStepsData((prev) =>
      prev
        .filter((_, index) => index !== indexToRmove)
        .map((step, newIndex) => ({
          ...step,
          step: newIndex + 1,
        }))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("submitted");
    try {
      // Create new Recipe
      const newRecipe = await addRecipe(recipeData);

      // Create Ingredients for the newly created Recipe
      const ingredientsPromises = ingredientsData.map((ingredient) =>
        addIngredient(newRecipe.id, {
          ...ingredient,
          recipe: newRecipe.id,
        })
      );
      await Promise.all(ingredientsPromises);

      // Create Steps for the newly created Recipe
      const stepsPromises = stepsData.map((step) =>
        addStep(newRecipe.id, {
          ...step,
          recipe: newRecipe.id,
        })
      );
      await Promise.all(stepsPromises);
      navigate(`/recipes/${newRecipe.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  // onChange handlers
  const handleRecipeChange = (event) => {
    const { name, value } = event.target;
    setRecipeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index, event) => {
    const { name, value } = event.target;
    setIngredientsData((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      if (name === "volume_unit" && value) {
        updated[index].weight_unit = "";
      }
      if (name === "weight_unit" && value) {
        updated[index].volume_unit = "";
      }

      return updated;
    });
  };

  const handleStepChange = (index, event) => {
    const { name, value } = event.target;
    setStepsData((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleCancel = () => {
    navigate(`/recipes/`);
  };

  return (
    <>
      <div className="recipe-form-page">
      <h1 className="recipeform-title">Log New Recipe</h1>

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-element">
          <div className="recipe-form">
            <label htmlFor="recipe-title">Title: </label>
            <input
              type="text"
              id="recipe-title"
              value={recipeData.title}
              onChange={handleRecipeChange}
              name="title"
            />
            <label htmlFor="recipe-notes">Notes:</label>
            <input
              type="text"
              id="recipe-notes"
              value={recipeData.notes}
              onChange={handleRecipeChange}
              name="notes"
            />
            <label htmlFor="recipe-favorite">Favorite</label>
            <input
              id="recipe-favorite"
              type="checkbox"
              defaultChecked={recipeData.favorite}
              onChange={handleRecipeChange}
            />
          </div>
          <div className="ingredient-container">
            {ingredientsData.map((ingredient, index) => (
              <div className="ingredient-form" key={index}>
                <label htmlFor={`ingredient-name-${index}`}>Ingredient: </label>
                <input
                  type="text"
                  id={`ingredient-name-${index}`}
                  value={ingredient.name}
                  onChange={(e) => {
                    handleIngredientChange(index, e);
                  }}
                  name="name"
                  autoComplete="false"
                />
                <label htmlFor={`ingredient-quantity-${index}`}>Quantity</label>
                <input
                  type="number"
                  id={`ingredient-quantity-${index}`}
                  value={ingredientsData.quantity}
                  onChange={(e) => handleIngredientChange(index, e)}
                  name="quantity"
                  className="quantity-input"
                />

                <label htmlFor={`ingredient-volume-${index}`}>Volume:</label>
                <select
                  id={`ingredient-volume-${index}`}
                  name="volume_unit"
                  value={ingredient.volume_unit || ""}
                  onChange={(e) => {
                    handleIngredientChange(index, e);
                  }}
                  disabled={ingredient.weight_unit !== ""}
                  className="volume-input"
                >
                  <option value="">---</option>
                  {VOLUME_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>

                <label htmlFor={`ingredient-weight-${index}`}>Weight:</label>
                <select
                  id={`ingredient-weight-${index}`}
                  name="weight_unit"
                  value={ingredient.weight_unit || ""}
                  onChange={(e) => {
                    handleIngredientChange(index, e);
                  }}
                  disabled={ingredient.volume_unit !== ""}
                  className="weight-input"
                >
                  <option value="">---</option>
                  {WEIGHT_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {ingredientsData.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      removeIngredient(index);
                    }}
                    className="form-btn"
                  >
                    Remove Ingredient
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addExtraIngredient} className="form-btn">
              Add Ingredient
            </button>
          </div>
          <div className="steps-container">
            {stepsData.map((step, index) => (
              <div className="step-form" key={index}>
                <label htmlFor={`step-number-${index}`}>Step</label>
                <input
                  type="number"
                  id={`step-number-${index}`}
                  value={step.step}
                  name="step"
                  readOnly
                  onChange={(e) => {
                    handleStepChange(index, e);
                  }}
                  className="step-number-input"
                />
                <label htmlFor={`step-description-${index}`}>Description</label>
                <input
                  type="text"
                  id={`step-description-${index}`}
                  value={step.description}
                  name="description"
                  onChange={(e) => {
                    handleStepChange(index, e);
                  }}
                />
                {stepsData.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      removeStep(index);
                    }}
                    className="form-btn"
                  >
                    Remove Step
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addExtraStep} className="form-btn">
              Add Step
            </button>
          </div>
          <button type="submit" className="form-btn">Add Recipe</button>
          <button type="button" onClick={handleCancel} className="form-btn">
            Cancel
          </button>
        </div>

      </form>
      </div>
    </>
  );
};

export default RecipeForm;
