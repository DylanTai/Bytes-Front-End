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
    favorite: null,
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
      number: 1,
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
          number: prev.length + 1,
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
          number: newIndex + 1,
        }))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const newRecipe = await addRecipe(recipeData);
      // setRecipeData(newRecipe);
      await addIngredient(newRecipe.id, ingredientsData);
      await addStep(newRecipe.id, stepsData);

      navigate(`/recipes/${newRecipe.id}`);
    } catch (error) {
      console.error(error);
    }
    console.log("submitted");
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

  return (
    <>
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
              type="checkbox"
              checked={recipeData.favorite}
              onChange={handleRecipeChange}
            />
          </div>

          <div className="ingredient-container">
            {ingredientsData.map((ingredient, index) => (
              <div className="ingredient-form" key={index}>
                <label htmlFor="ingredient-name">Ingredient: </label>
                <input
                  type="text"
                  id="ingredient-name"
                  value={ingredient.name}
                  onChange={(e) => {
                    handleIngredientChange(index, e);
                  }}
                  name="name"
                />
                <label htmlFor="ingredient-quantity">Quantity</label>
                <input
                  type="number"
                  id="ingredient-quantity"
                  value={ingredientsData.quantity}
                  onChange={(e) => handleIngredientChange(index, e)}
                  name="quantity"
                />

                <label htmlFor="ingredient-volume">Volume:</label>
                <select
                  name="volume_unit"
                  value={ingredient.volume_unit || ""}
                  onChange={(e) => {
                    handleIngredientChange(index, e);
                  }}
                  disabled={ingredient.weight_unit !== ""}
                >
                  <option value="">---</option>
                  {VOLUME_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>

                <label htmlFor="ingredient-weight">Weight:</label>
                <select
                  name="weight_unit"
                  value={ingredient.weight_unit || ""}
                  onChange={(e) => {
                    handleIngredientChange(index, e);
                  }}
                  disabled={ingredient.volume_unit !== ""}
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
                    onClick={(e) => {
                      e.preventDefault();
                      removeIngredient(index);
                    }}
                  >
                    Remove Ingredient
                  </button>
                )}
              </div>
            ))}
            <button onClick={addExtraIngredient}>Add Ingredient</button>
          </div>
          <div className="steps-component">
            {stepsData.map((step, index) => (
              <div className="step-form" key={index}>
                <label htmlFor={`step-num-${index}`}>step</label>
                <input
                  type="number"
                  id={`step-number-${index}`}
                  value={step.number}
                  name="number"
                  // onChange={(e) => handleStepChange(index, e)}
                  readOnly
                />
                <label htmlFor={`step-description-${index}`}>Description</label>
                <input
                  type="text"
                  id={`step-description-${index}`}
                  value={step.description}
                  name="description"
                  onChange={(e) => handleStepChange(index, e)}
                />
                {stepsData.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeStep(index);
                    }}
                  >
                    Remove step
                  </button>
                )}
              </div>
            ))}
            <button onClick={addExtraStep}>Add step</button>
          </div>

          <button type="submit">Add Recipe</button>
        </div>
      </form>
    </>
  );
};

export default RecipeForm;
