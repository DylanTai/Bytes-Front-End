import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import {
  addRecipe,
  addIngredient,
  addStep,
  deleteRecipe,
} from "../../services/recipeService.js";
import {
  VOLUME_UNITS,
  WEIGHT_UNITS,
  AVAILABLE_TAGS,
  calculateAllUnits,
} from "../../utils/recipeConfig/recipeConfig.js";
import "./RecipeForm.css";
import "../../utils/formError/formErrors.css";
import {
  createRecipeErrorState,
  cloneRecipeErrorState,
  addFieldError,
  addGeneralError,
  addIngredientError,
  addStepError,
  applyDetailsToRecipeErrors,
  hasRecipeErrors,
} from "../../utils/formError/formErrors.js";

const RecipeForm = ({ recipes, setRecipes }) => {
  const navigate = useNavigate();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      // Redirect to login if no token
      alert("Please log in to create a recipe.");
      navigate("/sign-in");
    }
  }, [navigate]);

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

  const [tags, setTags] = useState([]);

  const [errors, setErrors] = useState(() =>
    createRecipeErrorState(ingredientsData.length, stepsData.length)
  );

  // Track pre-calculated unit values for each ingredient to prevent rounding errors
  const [calculatedUnits, setCalculatedUnits] = useState([{}]);

  const resetErrorsStructure = (ingredientCount, stepCount) =>
    createRecipeErrorState(ingredientCount, stepCount);

  const clearGeneralErrors = () => {
    setErrors((prev) => {
      if (!prev.general?.length) return prev;
      const next = cloneRecipeErrorState(prev);
      next.general = [];
      return next;
    });
  };

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev.fields?.[field]?.length) return prev;
      const next = cloneRecipeErrorState(prev);
      delete next.fields[field];
      return next;
    });
  };

  const clearIngredientError = (index, field) => {
    setErrors((prev) => {
      const entry = prev.ingredients?.[index];
      if (!entry) return prev;
      if (field) {
        if (!entry[field]?.length) return prev;
      } else if (!Object.keys(entry).length) {
        return prev;
      }
      const next = cloneRecipeErrorState(prev);
      if (field) {
        delete next.ingredients[index][field];
      } else {
        next.ingredients[index] = {};
      }
      return next;
    });
  };

  const clearStepError = (index, field) => {
    setErrors((prev) => {
      const entry = prev.steps?.[index];
      if (!entry) return prev;
      if (field) {
        if (!entry[field]?.length) return prev;
      } else if (!Object.keys(entry).length) {
        return prev;
      }
      const next = cloneRecipeErrorState(prev);
      if (field) {
        delete next.steps[index][field];
      } else {
        next.steps[index] = {};
      }
      return next;
    });
  };

  const buildClientValidationErrors = () => {
    const validationErrors = createRecipeErrorState(
      ingredientsData.length,
      stepsData.length
    );

    const title = recipeData.title?.trim();
    if (!title) {
      addFieldError(validationErrors, "title", "Title is required.");
    }

    if (recipeData.notes && recipeData.notes.length > 250) {
      addFieldError(
        validationErrors,
        "notes",
        "Notes must be 250 characters or fewer."
      );
    }

    ingredientsData.forEach((ingredient, index) => {
      if (!ingredient.name?.trim()) {
        addIngredientError(validationErrors, index, "name", "Ingredient name is required.");
      }
    });

    stepsData.forEach((step, index) => {
      if (!step.description?.trim()) {
        addStepError(
          validationErrors,
          index,
          "description",
          "Step description is required."
        );
      }
    });

    return validationErrors;
  };

  // button handlers
  const addExtraIngredient = () => {
    setIngredientsData((prev) => [
      ...prev,
      {
        name: "",
        quantity: 0,
        volume_unit: "",
        weight_unit: "",
      },
    ]);
    setCalculatedUnits((prev) => [...prev, {}]);
    setErrors((prev) => {
      const next = cloneRecipeErrorState(prev);
      next.ingredients.push({});
      return next;
    });
  };

  const removeIngredient = (indexToRemove) => {
    setIngredientsData((prev) =>
      prev
        .filter((_, index) => index !== indexToRemove)
        .map((ingredient) => ({
          ...ingredient,
        }))
    );
    setCalculatedUnits((prev) => prev.filter((_, index) => index !== indexToRemove));
    setErrors((prev) => {
      const next = cloneRecipeErrorState(prev);
      next.ingredients.splice(indexToRemove, 1);
      return next;
    });
  };

  const addExtraStep = () => {
    setStepsData((prev) => [
      ...prev,
      {
        step: prev.length + 1,
        description: "",
      },
    ]);
    setErrors((prev) => {
      const next = cloneRecipeErrorState(prev);
      next.steps.push({});
      return next;
    });
  };

  const removeStep = (indexToRemove) => {
    setStepsData((prev) =>
      prev
        .filter((_, index) => index !== indexToRemove)
        .map((step, newIndex) => ({
          ...step,
          step: newIndex + 1,
        }))
    );
    setErrors((prev) => {
      const next = cloneRecipeErrorState(prev);
      next.steps.splice(indexToRemove, 1);
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = buildClientValidationErrors();
    if (hasRecipeErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors(resetErrorsStructure(ingredientsData.length, stepsData.length));

    try {
      const payload = {
        ...recipeData,
        title: recipeData.title.trim(),
        notes: recipeData.notes?.trim() || "",
        tags,
      };

      const newRecipe = await addRecipe(payload);

      const ingredientErrors = [];
      const ingredientsPromises = ingredientsData.map((ingredient, index) =>
        addIngredient(newRecipe.id, {
          ...ingredient,
          name: ingredient.name?.trim(),
          recipe: newRecipe.id,
        }).catch((error) => {
          ingredientErrors.push({
            status: error?.status,
            details: error?.details,
            message: error?.message,
            context: {
              type: "ingredient",
              index,
              name: ingredient.name,
            },
          });
        })
      );

      const stepErrors = [];
      const stepsPromises = stepsData.map((step, index) =>
        addStep(newRecipe.id, {
          ...step,
          description: step.description?.trim(),
          recipe: newRecipe.id,
        }).catch((error) => {
          stepErrors.push({
            status: error?.status,
            details: error?.details,
            message: error?.message,
            context: {
              type: "step",
              index,
              stepNumber: step.step,
            },
          });
        })
      );

      await Promise.all([...ingredientsPromises, ...stepsPromises]);

      const collectedErrors = [...ingredientErrors, ...stepErrors];

      if (collectedErrors.length) {
        const authError = collectedErrors.find(
          (currentError) =>
            currentError?.status === 401 || currentError?.message === "Authentication failed"
        );

        if (authError) {
          alert("Authentication error. Your session may have expired. Please log in again.");
          navigate("/sign-in");
          return;
        }

        const backendErrors = createRecipeErrorState(
          ingredientsData.length,
          stepsData.length
        );

        collectedErrors.forEach((currentError) => {
          if (currentError?.details) {
            applyDetailsToRecipeErrors(
              backendErrors,
              currentError.details,
              currentError.context
            );
          } else if (currentError?.message) {
            addGeneralError(backendErrors, currentError.message, currentError.context);
          } else {
            addGeneralError(
              backendErrors,
              "An unexpected error occurred while saving the recipe.",
              currentError?.context
            );
          }
        });

        if (!hasRecipeErrors(backendErrors)) {
          addGeneralError(
            backendErrors,
            "Unable to create recipe due to an unexpected error. Please try again."
          );
        }

        await deleteRecipe(newRecipe.id).catch(() => {});
        setErrors(backendErrors);
        return;
      }

      navigate(`/recipes/${newRecipe.id}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      if (error.status === 400) {
        const backendErrors = createRecipeErrorState(
          ingredientsData.length,
          stepsData.length
        );
        applyDetailsToRecipeErrors(backendErrors, error.details, error.context);
        if (!hasRecipeErrors(backendErrors)) {
          addGeneralError(
            backendErrors,
            error.message || "Validation failed. Please review your entries."
          );
        }
        setErrors(backendErrors);
        return;
      }

      if (error.status === 401 || error.message === "Authentication failed") {
        alert("Authentication error. Your session may have expired. Please log in again.");
        navigate("/sign-in");
        return;
      }

      alert(`An error occurred: ${error.message}`);
    }
  };

  // onChange handlers
  const handleRecipeChange = (event) => {
    const { name, value, type, checked } = event.target;
    setRecipeData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearFieldError(name);
    clearGeneralErrors();
  };

  const handleIngredientChange = (index, event) => {
    const { name, value } = event.target;
    clearIngredientError(index, name);
    clearIngredientError(index, "general");
    clearGeneralErrors();
    setIngredientsData((prev) => {
      const updated = [...prev];
      const currentIngredient = updated[index];
      
      // Handle quantity change
      if (name === "quantity") {
        updated[index].quantity = value;
        
        // If a unit is already selected, recalculate all possible values
        if (currentIngredient.volume_unit) {
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = calculateAllUnits(value, currentIngredient.volume_unit, true);
            return updatedCalc;
          });
        } else if (currentIngredient.weight_unit) {
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = calculateAllUnits(value, currentIngredient.weight_unit, false);
            return updatedCalc;
          });
        }
      }
      // Handle volume unit change
      else if (name === "volume_unit") {
        const oldUnit = currentIngredient.volume_unit;
        const newUnit = value;
        
        // If clearing the unit (setting to ""), clear quantity and calculated values
        if (!newUnit) {
          updated[index].quantity = 0;
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = {};
            return updatedCalc;
          });
        }
        // If selecting a unit for the first time (from ""), calculate all units
        else if (!oldUnit && newUnit) {
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = calculateAllUnits(currentIngredient.quantity, newUnit, true);
            return updatedCalc;
          });
        }
        // If switching between units, look up the pre-calculated value
        else if (oldUnit && newUnit && oldUnit !== newUnit) {
          const calculatedValue = calculatedUnits[index]?.[newUnit];
          if (calculatedValue !== undefined) {
            updated[index].quantity = calculatedValue;
          }
        }
        
        updated[index].volume_unit = newUnit;
        // Clear weight unit when volume is selected
        if (newUnit) {
          updated[index].weight_unit = "";
        }
      }
      // Handle weight unit change
      else if (name === "weight_unit") {
        const oldUnit = currentIngredient.weight_unit;
        const newUnit = value;
        
        // If clearing the unit (setting to ""), clear quantity and calculated values
        if (!newUnit) {
          updated[index].quantity = 0;
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = {};
            return updatedCalc;
          });
        }
        // If selecting a unit for the first time (from ""), calculate all units
        else if (!oldUnit && newUnit) {
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = calculateAllUnits(currentIngredient.quantity, newUnit, false);
            return updatedCalc;
          });
        }
        // If switching between units, look up the pre-calculated value
        else if (oldUnit && newUnit && oldUnit !== newUnit) {
          const calculatedValue = calculatedUnits[index]?.[newUnit];
          if (calculatedValue !== undefined) {
            updated[index].quantity = calculatedValue;
          }
        }
        
        updated[index].weight_unit = newUnit;
        // Clear volume unit when weight is selected
        if (newUnit) {
          updated[index].volume_unit = "";
        }
      }
      // Handle other field changes (name)
      else {
        updated[index][name] = value;
      }

      return updated;
    });
  };

  const handleStepChange = (index, event) => {
    const { name, value } = event.target;
    clearStepError(index, name);
    clearStepError(index, "general");
    clearGeneralErrors();
    setStepsData((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleTagChange = (tagValue) => {
    clearGeneralErrors();
    setTags((prev) => {
      if (prev.includes(tagValue)) {
        // Remove tag if already selected
        return prev.filter((tag) => tag !== tagValue);
      } else {
        // Add tag if not selected
        return [...prev, tagValue];
      }
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
        {errors.general?.length > 0 && (
          <div className="error-messages" role="alert">
            <ul>
              {errors.general.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="form-element">
          <div className="recipe-field-row">
            <label htmlFor="recipe-title">Title: </label>
            <input
              type="text"
              id="recipe-title"
              value={recipeData.title}
              onChange={handleRecipeChange}
              name="title"
              className={errors.fields?.title?.length ? "input-error" : ""}
              placeholder={errors.fields?.title?.[0] || ""}
              aria-invalid={errors.fields?.title?.length ? "true" : "false"}
            />
          </div>
          <div className="recipe-field-row">
            <label htmlFor="recipe-notes">Notes:</label>
            <input
              type="text"
              id="recipe-notes"
              value={recipeData.notes}
              onChange={handleRecipeChange}
              name="notes"
              className={errors.fields?.notes?.length ? "input-error" : ""}
              placeholder={errors.fields?.notes?.[0] || ""}
              aria-invalid={errors.fields?.notes?.length ? "true" : "false"}
            />
          </div>
          <div className="recipe-field-row">
            <label htmlFor="recipe-favorite">Favorite</label>
            <input
              id="recipe-favorite"
              type="checkbox"
              checked={recipeData.favorite}
              onChange={handleRecipeChange}
              name="favorite"
            />
          </div>
          
          <div className="tags-container">
            <h3>Tags</h3>
            <div className="tags-grid">
              {AVAILABLE_TAGS.map((tag) => (
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
                  className={
                    errors.ingredients?.[index]?.name?.length ? "input-error" : ""
                  }
                  placeholder={errors.ingredients?.[index]?.name?.[0] || ""}
                  aria-invalid={errors.ingredients?.[index]?.name?.length ? "true" : "false"}
                />
                <label htmlFor={`ingredient-quantity-${index}`}>Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  id={`ingredient-quantity-${index}`}
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, e)}
                  name="quantity"
                  className={`quantity-input ${
                    errors.ingredients?.[index]?.quantity?.length ? "input-error" : ""
                  }`}
                  placeholder={errors.ingredients?.[index]?.quantity?.[0] || ""}
                  aria-invalid={errors.ingredients?.[index]?.quantity?.length ? "true" : "false"}
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
                  className={`volume-input ${
                    errors.ingredients?.[index]?.volume_unit?.length ? "input-error" : ""
                  }`}
                  aria-invalid={errors.ingredients?.[index]?.volume_unit?.length ? "true" : "false"}
                  title={errors.ingredients?.[index]?.volume_unit?.[0] || ""}
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
                  className={`weight-input ${
                    errors.ingredients?.[index]?.weight_unit?.length ? "input-error" : ""
                  }`}
                  aria-invalid={errors.ingredients?.[index]?.weight_unit?.length ? "true" : "false"}
                  title={errors.ingredients?.[index]?.weight_unit?.[0] || ""}
                >
                  <option value="">---</option>
                  {WEIGHT_UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {errors.ingredients?.[index]?.general?.length && (
                  <p className="field-error">
                    {errors.ingredients[index].general.join(", ")}
                  </p>
                )}
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
                  className={
                    errors.steps?.[index]?.description?.length ? "input-error" : ""
                  }
                  placeholder={errors.steps?.[index]?.description?.[0] || ""}
                  aria-invalid={errors.steps?.[index]?.description?.length ? "true" : "false"}
                />
                {errors.steps?.[index]?.general?.length && (
                  <p className="field-error">
                    {errors.steps[index].general.join(", ")}
                  </p>
                )}
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
