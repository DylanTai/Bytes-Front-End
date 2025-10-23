import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import {
  addIngredient,
  addStep,
  getRecipe,
  getIngredients,
  getSteps,
  updateRecipe,
  updateIngredient,
  updateStep,
} from "../../services/recipeService.js";
import {
  VOLUME_UNITS,
  WEIGHT_UNITS,
  AVAILABLE_TAGS,
  calculateAllUnits,
} from "../../utils/recipeConfig/recipeConfig.js";
import "./RecipeEdit.css";
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

const RecipeEdit = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      alert("Please log in to edit a recipe.");
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
    createRecipeErrorState(
      ingredientsData.length,
      stepsData.length
    )
  );

  // Track pre-calculated unit values for each ingredient to prevent rounding errors
  const [calculatedUnits, setCalculatedUnits] = useState([]);

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
        addIngredientError(
          validationErrors,
          index,
          "name",
          "Ingredient name is required."
        );
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

  useEffect(() => {
    const getDetails = async () => {
      try {
        const recipeValue = await getRecipe(recipeId);
        const ingredientsValue = await getIngredients(recipeId);
        const stepsValue = await getSteps(recipeId);

        setRecipeData({
          title: recipeValue.title || "",
          notes: recipeValue.notes || "",
          favorite: Boolean(recipeValue.favorite),
          image: recipeValue.image ?? null,
        });
        setIngredientsData(ingredientsValue);
        
        // Initialize calculated units for existing ingredients
        const initialCalculatedUnits = ingredientsValue.map((ingredient) => {
          if (ingredient.volume_unit) {
            return calculateAllUnits(ingredient.quantity, ingredient.volume_unit, true);
          } else if (ingredient.weight_unit) {
            return calculateAllUnits(ingredient.quantity, ingredient.weight_unit, false);
          }
          return {};
        });
        setCalculatedUnits(initialCalculatedUnits);
        
        // Sort steps by step number before setting state
        const sortedSteps = stepsValue.sort((a, b) => a.step - b.step);
        setStepsData(sortedSteps);
        setErrors(
          resetErrorsStructure(ingredientsValue.length, sortedSteps.length)
        );
        
        // Set tags if they exist in the recipe data
        if (recipeValue.tags && Array.isArray(recipeValue.tags)) {
          setTags(recipeValue.tags);
        }
      } catch (error) {
        console.error("Error fetching recipe details:", error);
        if (error.message === "Recipe not found") {
          alert("Recipe not found");
          navigate("/recipes");
        } else if (error.message.includes("Failed to fetch")) {
          alert("Authentication error. Please log in again.");
          navigate("/sign-in");
        }
      }
    };

    getDetails();
  }, [recipeId, navigate]);

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

    const backendErrors = createRecipeErrorState(
      ingredientsData.length,
      stepsData.length
    );

    const payload = {
      title: recipeData.title.trim(),
      notes: recipeData.notes?.trim() || "",
      favorite: Boolean(recipeData.favorite),
      tags,
    };

    if (recipeData.image !== undefined) {
      payload.image = recipeData.image;
    }

    try {
      await updateRecipe(recipeId, payload);
    } catch (error) {
      console.error("Error updating recipe:", error);

      if (error.status === 400) {
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
      return;
    }

    const ingredientCreateErrors = [];
    const ingredientUpdateErrors = [];
    const stepCreateErrors = [];
    const stepUpdateErrors = [];

    const ingredientCreatePromises = ingredientsData
      .map((ingredient, index) => ({ ingredient, index }))
      .filter(({ ingredient }) => !ingredient.id)
      .map(({ ingredient, index }) =>
        addIngredient(recipeId, {
          ...ingredient,
          name: ingredient.name?.trim(),
          recipe: recipeId,
        }).catch((error) => {
          ingredientCreateErrors.push({
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

    const ingredientUpdatePromises = ingredientsData
      .map((ingredient, index) => ({ ingredient, index }))
      .filter(({ ingredient }) => ingredient.id)
      .map(({ ingredient, index }) =>
        updateIngredient(recipeId, ingredient.id, {
          ...ingredient,
          name: ingredient.name?.trim(),
        }).catch((error) => {
          ingredientUpdateErrors.push({
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

    const stepCreatePromises = stepsData
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => !step.id)
      .map(({ step, index }) =>
        addStep(recipeId, {
          ...step,
          description: step.description?.trim(),
          recipe: recipeId,
        }).catch((error) => {
          stepCreateErrors.push({
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

    const stepUpdatePromises = stepsData
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.id)
      .map(({ step, index }) =>
        updateStep(recipeId, step.id, {
          ...step,
          description: step.description?.trim(),
        }).catch((error) => {
          stepUpdateErrors.push({
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

    await Promise.all([
      ...ingredientCreatePromises,
      ...ingredientUpdatePromises,
      ...stepCreatePromises,
      ...stepUpdatePromises,
    ]);

    const collectedErrors = [
      ...ingredientCreateErrors,
      ...ingredientUpdateErrors,
      ...stepCreateErrors,
      ...stepUpdateErrors,
    ];

    if (collectedErrors.length) {
      const authError = collectedErrors.find(
        (error) =>
          error?.status === 401 || error?.message === "Authentication failed"
      );

      if (authError) {
        alert("Authentication error. Your session may have expired. Please log in again.");
        navigate("/sign-in");
        return;
      }

      collectedErrors.forEach((currentError) => {
        if (currentError?.details) {
          applyDetailsToRecipeErrors(
            backendErrors,
            currentError.details,
            currentError.context
          );
        } else if (currentError?.message) {
          addGeneralError(
            backendErrors,
            currentError.message,
            currentError.context
          );
        } else {
          addGeneralError(
            backendErrors,
            "An unexpected error occurred while saving your changes.",
            currentError?.context
          );
        }
      });

      if (!hasRecipeErrors(backendErrors)) {
        addGeneralError(
          backendErrors,
          "Unable to update recipe due to an unexpected error. Please try again."
        );
      }

      setErrors(backendErrors);
      return;
    }

    navigate(`/recipes/${recipeId}`);
  };

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
    navigate(`/recipes/${recipeId}`);
  };

  return (
    <>
      <h1 className="recipeform-title">Edit Recipe</h1>

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
              name="favorite"
              checked={recipeData.favorite}
              onChange={handleRecipeChange}
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
                <div
                  className={`input-wrapper ingredient-input ${
                    errors.ingredients?.[index]?.name?.length ? "has-error" : ""
                  }`}
                >
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
                    aria-invalid={errors.ingredients?.[index]?.name?.length ? "true" : "false"}
                  />
                  <span
                    className={`field-error-inline ${
                      errors.ingredients?.[index]?.name?.length
                        ? ""
                        : "field-error-hidden"
                    }`}
                    aria-live="polite"
                    aria-hidden={
                      errors.ingredients?.[index]?.name?.length ? "false" : "true"
                    }
                  >
                    {errors.ingredients?.[index]?.name?.[0] || ""}
                  </span>
                </div>
                <label htmlFor={`ingredient-quantity-${index}`}>Quantity</label>
                <div
                  className={`input-wrapper quantity-wrapper ${
                    errors.ingredients?.[index]?.quantity?.length ? "has-error" : ""
                  }`}
                >
                  <input
                    type="number"
                    step="0.01"
                    id={`ingredient-quantity-${index}`}
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, e)}
                    name="quantity"
                    className={
                      errors.ingredients?.[index]?.quantity?.length ? "input-error" : ""
                    }
                    aria-invalid={errors.ingredients?.[index]?.quantity?.length ? "true" : "false"}
                  />
                  <span
                    className={`field-error-inline ${
                      errors.ingredients?.[index]?.quantity?.length
                        ? ""
                        : "field-error-hidden"
                    }`}
                    aria-live="polite"
                    aria-hidden={
                      errors.ingredients?.[index]?.quantity?.length ? "false" : "true"
                    }
                  >
                    {errors.ingredients?.[index]?.quantity?.[0] || ""}
                  </span>
                </div>

                <label htmlFor={`ingredient-volume-${index}`}>Volume:</label>
                <select
                  id={`ingredient-volume-${index}`}
                  name="volume_unit"
                  value={ingredient.volume_unit || ""}
                  onChange={(e) => {
                    handleIngredientChange(index, e);
                  }}
                  disabled={ingredient.weight_unit !== ""}
                  className={
                    errors.ingredients?.[index]?.volume_unit?.length ? "input-error" : ""
                  }
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
                  className={
                    errors.ingredients?.[index]?.weight_unit?.length ? "input-error" : ""
                  }
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
                <div
                  className={`input-wrapper ${
                    errors.steps?.[index]?.description?.length ? "has-error" : ""
                  }`}
                >
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
                    aria-invalid={errors.steps?.[index]?.description?.length ? "true" : "false"}
                  />
                  <span
                    className={`field-error-inline ${
                      errors.steps?.[index]?.description?.length ? "" : "field-error-hidden"
                    }`}
                    aria-live="polite"
                    aria-hidden={
                      errors.steps?.[index]?.description?.length ? "false" : "true"
                    }
                  >
                    {errors.steps?.[index]?.description?.[0] || ""}
                  </span>
                </div>
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

          <button type="submit" className="form-btn">Update Recipe</button>
          <button type="button" onClick={handleCancel} className="form-btn">
            Cancel
          </button>
        </div>
      </form>
    </>
  );
};

export default RecipeEdit;
