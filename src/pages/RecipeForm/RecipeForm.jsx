import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import {
  addRecipe,
  addIngredient,
  addStep,
} from "../../services/recipeService.js";
import {
  VOLUME_UNITS,
  WEIGHT_UNITS,
  AVAILABLE_TAGS,
  calculateAllUnits,
} from "../../config/recipeConfig.js";
import "./RecipeForm.css";

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Track pre-calculated unit values for each ingredient to prevent rounding errors
  const [calculatedUnits, setCalculatedUnits] = useState([{}]);

  // Image handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, JPEG, PNG, GIF, or WebP)');
        // Reset file input
        e.target.value = '';
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('Image file size must be less than 5MB');
        e.target.value = '';
        return;
      }

      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("recipe-image");
    if (fileInput) fileInput.value = "";
  };

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
    // Add empty calculated units for new ingredient
    setCalculatedUnits((prev) => [...prev, {}]);
  };

  const removeIngredient = (indexToRmove) => {
    setIngredientsData((prev) =>
      prev
        .filter((_, index) => index !== indexToRmove)
        .map((ingredient) => ({
          ...ingredient,
        }))
    );
    // Remove calculated units for removed ingredient
    setCalculatedUnits((prev) => prev.filter((_, index) => index !== indexToRmove));
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
      // Create FormData for image upload
      const formData = new FormData();
      formData.append("title", recipeData.title);
      formData.append("notes", recipeData.notes);
      formData.append("favorite", recipeData.favorite);
      formData.append("tags", JSON.stringify(tags));
      
      // Add image if one was selected
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Create new Recipe with image
      const newRecipe = await addRecipe(formData);

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
      console.error("Error in handleSubmit:", error);
      
      // Handle different types of errors
      if (error.status === 400) {
        // Validation error - don't redirect to sign-in
        const details = error.details;
        let errorMessage = "Please check your recipe data:\n";
        
        if (details && typeof details === 'object') {
          // Format validation errors
          Object.entries(details).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessage += `\n${field}: ${messages.join(', ')}`;
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

  // onChange handlers
  const handleRecipeChange = (event) => {
    const { name, value, type, checked } = event.target;
    setRecipeData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleIngredientChange = (index, event) => {
    const { name, value } = event.target;
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
    setStepsData((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleTagChange = (tagValue) => {
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
    navigate(`/`);
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
              checked={recipeData.favorite}
              onChange={handleRecipeChange}
              name="favorite"
            />

            {/* Image Upload Section */}
            <div className="image-upload-section">
              <label htmlFor="recipe-image">Recipe Image:</label>
              <p className="image-upload-hint">Supported formats: JPG, JPEG, PNG, GIF, WebP (Max 5MB)</p>
              <input
                type="file"
                id="recipe-image"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
              />
              
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Recipe preview" className="image-preview" />
                  <button type="button" onClick={handleRemoveImage} className="remove-image-btn">
                    Remove Image
                  </button>
                </div>
              )}
            </div>
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
                />
                <label htmlFor={`ingredient-quantity-${index}`}>Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  id={`ingredient-quantity-${index}`}
                  value={ingredient.quantity}
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