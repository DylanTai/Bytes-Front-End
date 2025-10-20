import { useState } from "react";
import { useNavigate } from "react-router";

import { addRecipe } from "../../services/recipeService.js";
import "./RecipeForm.css";

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

  const [recipeData, setRecipeData] = useState({
    title: "",
    notes: "",
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

  const addExtraStep = (e) => {
    setStepsData((prev) => {
      return [
        ...prev,
        {
          number: 1,
          description: "",
        },
      ];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("submitted");
    // if (!recipeData.physical || !recipeData.emotion) {
    //   alert("Please complete the form before submitting!");
    //   return;
    // }

    // try {
    //   const recipeRequest = await addRecipe(recipeData);

    //   if (recipes) setRecipes([...recipes, recipeRequest]);
    //   else setRecipes([recipeRequest]);
    //   setRecipeData({
    //     emotion: "",
    //     physical: "",
    //     intensity: 5,
    //     timeOfEmotion: formatDate(new Date()),
    //     comments: { note: "" },
    //   });
    //   navigate("/");
    // } catch (error) {}
  };

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
              </div>
            ))}

            <button onClick={addExtraIngredient}>Add Extra Ingredient</button>
          </div>
          <div className="steps-component">
            {stepsData.map((step, index) => (
              <div className="step-form" key={index}>
                <label htmlFor={`step-num-${index}`}>step</label>
                <input
                  type="number"
                  id="step-number"
                  value={step.number}
                  onChange={(e) => handleStepChange(index, e)}
                />
                <label htmlFor={`step-description-${index}`}>Description</label>
                <input
                  type="text"
                  id="step-description"
                  value={step.description}
                  onChange={(e) => handleStepChange(index, e)}
                ></input>
              </div>
            ))}
            <button onClick={addExtraStep}>Add Extra step</button>
          </div>

          <button type="submit">Add Recipe</button>
        </div>
      </form>
    </>
  );
};

export default RecipeForm;

{
  /* <select
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
          </select> */
}
