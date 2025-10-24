import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getRecipe,
  updateRecipe,
  getIngredients,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  getSteps,
  addStep,
  updateStep,
  deleteStep,
} from "../../services/recipeService.js";
import {
  VOLUME_UNITS,
  WEIGHT_UNITS,
  AVAILABLE_TAGS,
  calculateAllUnits,
} from "../../config/recipeConfig.js";
import "./RecipeEdit.css";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";

const RecipeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipeData, setRecipeData] = useState({
    title: "",
    notes: "",
    favorite: false,
    image: null,
  });

  const [ingredientsData, setIngredientsData] = useState([]);
  const [stepsData, setStepsData] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [calculatedUnits, setCalculatedUnits] = useState([]);
  const [formErrors, setFormErrors] = useState({}); // ADD THIS LINE

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [hasExistingImage, setHasExistingImage] = useState(false);

  // helpers for loading animation
  const startLoading = () => {
    startLoading(true);
    const timer = setTimeout(() => setShowAnimation(true), 400);
    return timer;
  }

  const stopLoading = (timer) => {
    clearTimeout(timer);
    setLoading(false);
    setShowAnimation(false);
  }

  useEffect(() => {
    const fetchRecipeData = async () => {
      const timer = startLoading();
      try {
        const recipe = await getRecipe(id);
        const ingredients = await getIngredients(id);
        const steps = await getSteps(id);

        setRecipeData({
          title: recipe.title || "",
          notes: recipe.notes || "",
          favorite: recipe.favorite || false,
          image: recipe.image || null,
        });

        // Set existing image as preview if it exists (S3 returns full URL)
        if (recipe.image) {
          setHasExistingImage(true);
          setImagePreview(recipe.image);
        }

        setIngredientsData(
          ingredients.map((ing) => ({
            id: ing.id,
            name: ing.name,
            quantity: ing.quantity,
            volume_unit: ing.volume_unit || "",
            weight_unit: ing.weight_unit || "",
            isNew: false,
          }))
        );

        setStepsData(
          steps.map((step) => ({
            id: step.id,
            step: step.step,
            description: step.description,
            isNew: false,
          }))
        );

        setTags(recipe.tags || []);

        // Initialize calculated units for existing ingredients
        const initialCalcUnits = ingredients.map((ing) => {
          const unit = ing.volume_unit || ing.weight_unit;
          const isVolume = !!ing.volume_unit;
          return unit ? calculateAllUnits(ing.quantity, unit, isVolume) : {};
        });
        setCalculatedUnits(initialCalcUnits);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        alert("Failed to load recipe. You may not have permission to view it.");
        navigate("/");
      } finally {
        stopLoading(timer);
      }
    };

    fetchRecipeData();
  }, [id, navigate]);

  // Image handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, JPEG, PNG, GIF, or WebP)');
        e.target.value = '';
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Image file size must be less than 5MB');
        e.target.value = '';
        return;
      }

      setImageFile(file);
      setRemoveExistingImage(false);
      setHasExistingImage(false);
      
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
    setHasExistingImage(false);
    // Reset file input
    const fileInput = document.getElementById("recipe-image");
    if (fileInput) fileInput.value = "";
  };

  const handleRecipeChange = (event) => {
    const { name, value, type, checked } = event.target;
    setRecipeData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIngredientChange = (index, event) => {
    const { name, value } = event.target;
    setIngredientsData((prev) => {
      const updated = [...prev];
      const currentIngredient = updated[index];

      if (name === "quantity") {
        updated[index].quantity = value;

        if (currentIngredient.volume_unit) {
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = calculateAllUnits(
              value,
              currentIngredient.volume_unit,
              true
            );
            return updatedCalc;
          });
        } else if (currentIngredient.weight_unit) {
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = calculateAllUnits(
              value,
              currentIngredient.weight_unit,
              false
            );
            return updatedCalc;
          });
        }
      } else if (name === "volume_unit") {
        const oldUnit = currentIngredient.volume_unit;
        const newUnit = value;

        if (!newUnit) {
          updated[index].quantity = 0;
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = {};
            return updatedCalc;
          });
        } else if (!oldUnit && newUnit) {
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = calculateAllUnits(
              currentIngredient.quantity,
              newUnit,
              true
            );
            return updatedCalc;
          });
        } else if (oldUnit && newUnit && oldUnit !== newUnit) {
          const calculatedValue = calculatedUnits[index]?.[newUnit];
          if (calculatedValue !== undefined) {
            updated[index].quantity = calculatedValue;
          }
        }

        updated[index].volume_unit = newUnit;
        if (newUnit) {
          updated[index].weight_unit = "";
        }
      } else if (name === "weight_unit") {
        const oldUnit = currentIngredient.weight_unit;
        const newUnit = value;

        if (!newUnit) {
          updated[index].quantity = 0;
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = {};
            return updatedCalc;
          });
        } else if (!oldUnit && newUnit) {
          setCalculatedUnits((prevCalc) => {
            const updatedCalc = [...prevCalc];
            updatedCalc[index] = calculateAllUnits(
              currentIngredient.quantity,
              newUnit,
              false
            );
            return updatedCalc;
          });
        } else if (oldUnit && newUnit && oldUnit !== newUnit) {
          const calculatedValue = calculatedUnits[index]?.[newUnit];
          if (calculatedValue !== undefined) {
            updated[index].quantity = calculatedValue;
          }
        }

        updated[index].weight_unit = newUnit;
        if (newUnit) {
          updated[index].volume_unit = "";
        }
      } else {
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
        return prev.filter((tag) => tag !== tagValue);
      } else {
        return [...prev, tagValue];
      }
    });
  };

  const addExtraIngredient = () => {
    setIngredientsData((prev) => [
      ...prev,
      {
        name: "",
        quantity: 0,
        volume_unit: "",
        weight_unit: "",
        isNew: true,
      },
    ]);
    setCalculatedUnits((prev) => [...prev, {}]);
  };

  const removeIngredient = async (index) => {
    const ingredient = ingredientsData[index];

    if (!ingredient.isNew && ingredient.id) {
      try {
        await deleteIngredient(id, ingredient.id);
      } catch (error) {
        console.error("Error deleting ingredient:", error);
        alert("Failed to delete ingredient");
        return;
      }
    }

    setIngredientsData((prev) => prev.filter((_, i) => i !== index));
    setCalculatedUnits((prev) => prev.filter((_, i) => i !== index));
  };

  const addExtraStep = () => {
    setStepsData((prev) => [
      ...prev,
      {
        step: prev.length + 1,
        description: "",
        isNew: true,
      },
    ]);
  };

  const removeStep = async (index) => {
    const step = stepsData[index];

    // If it's an existing step (not new), delete it from the backend
    if (!step.isNew && step.id) {
      try {
        await deleteStep(id, step.id);
      } catch (error) {
        console.error("Error deleting step:", error);
        alert("Failed to delete step");
        return;
      }
    }

    // Remove from local state and renumber remaining steps
    setStepsData((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, newIndex) => ({
          ...step,
          step: newIndex + 1,
        }))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append("title", recipeData.title);
      formData.append("notes", recipeData.notes);
      formData.append("favorite", recipeData.favorite);
      formData.append("tags", JSON.stringify(tags));

      // Handle image
      if (imageFile) {
        // New image uploaded
        formData.append("image", imageFile);
      } else if (removeExistingImage) {
        // User wants to remove the existing image
        formData.append("image", "");
      }
      // If neither, keep existing image (don't append anything)

      // Update recipe
      await updateRecipe(id, formData);

      // Update or create ingredients
      for (const ingredient of ingredientsData) {
        const ingredientPayload = {
          name: ingredient.name,
          quantity: ingredient.quantity,
          volume_unit: ingredient.volume_unit || "",
          weight_unit: ingredient.weight_unit || "",
          recipe: id,
        };

        if (ingredient.isNew) {
          await addIngredient(id, ingredientPayload);
        } else {
          await updateIngredient(id, ingredient.id, ingredientPayload);
        }
      }

      // Update or create steps
      for (const step of stepsData) {
        const stepPayload = {
          step: step.step,
          description: step.description,
          recipe: id,
        };

        if (step.isNew) {
          await addStep(id, stepPayload);
        } else {
          await updateStep(id, step.id, stepPayload);
        }
      }

      alert("Recipe updated successfully!");
      navigate(`/recipes/${id}`);
    } catch (error) {
      console.error("Error updating recipe:", error);
      
      // Handle different types of errors
      if (error.status === 400) {
        const details = error.details;
        let errorMessage = "Please check your recipe data:\n";
        
        if (details && typeof details === 'object') {
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
        alert("Your session has expired. Please log in again.");
        navigate("/sign-in");
      } else {
        alert(`Failed to update recipe: ${error.message}`);
      }
    }
  };

  const handleCancel = () => {
    navigate(`/recipes/${id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="recipe-form-page">
      <h1 className="recipeform-title">Edit Recipe</h1>


      <form onSubmit={handleSubmit} className="edit-recipe-form">
        {formErrors.length > 0 && (
          <div className="error-messages" role="alert">
            <ul>
              {formErrors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="form-element">
          <div className="recipe-form">
            <div>
            <label htmlFor="recipe-title">Title: </label>
            <input
              type="text"
              id="recipe-title"
              value={recipeData.title}
              onChange={handleRecipeChange}
              name="title"
              required
              className="recipe-title-input"
            />
            </div>
            <div>
            <label htmlFor="recipe-notes">Notes:</label>
            <textarea
              type="text"
              id="recipe-notes"
              value={recipeData.notes}
              onChange={handleRecipeChange}
              name="notes"
              className="recipe-notes-input"
            />
            </div>
            <div>
            <label htmlFor="recipe-favorite">Favorite</label>
            <input
              id="recipe-favorite"
              type="checkbox"
              checked={recipeData.favorite}
              onChange={handleRecipeChange}
              className="edit-recipe-favorite-input"
              name="favorite"
            />
            </div>

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
              
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Recipe preview" className="image-preview" />
                  <button type="button" onClick={handleRemoveImage} className="remove-image-btn">
                    Remove Image
                  </button>
                </div>
              ) : (
                hasExistingImage && !removeExistingImage && (
                  <div className="image-preview-container">
                    <p>Current image (no changes):</p>
                    <img 
                      src={recipeData.image}
                      alt="Current recipe" 
                      className="image-preview" 
                    />
                    <button type="button" onClick={handleRemoveImage} className="remove-image-btn">
                      Remove Image
                    </button>
                  </div>
                )
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

          <div className="edit-ingredient-container">
            {ingredientsData.map((ingredient, index) => (
              <div className="ingredient-form" key={index}>
                <label htmlFor={`ingredient-name-${index}`}>Ingredient: </label>
                <input
                  type="text"
                  id={`ingredient-name-${index}`}
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, e)}
                  name="name"
                  autoComplete="off"
                  className="add-ingredient-input"
                />

                <label htmlFor={`ingredient-quantity-${index}`}>Quantity:</label>
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
                  onChange={(e) => handleIngredientChange(index, e)}
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
                  onChange={(e) => handleIngredientChange(index, e)}
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
          <div className="edit-steps-component">
            {stepsData.map((step, index) => (
              <div className="step-form" key={index}>
                <label htmlFor={`step-number-${index}`}>Step:</label>
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
                <textarea
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
                    Remove step
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addExtraStep} className="form-btn">
              Add Step
            </button>
          </div>
            <div className="recipe-form-btns">
          <button type="submit" className="form-btn">Update Recipe</button>
          <button type="button" onClick={handleCancel} className="form-btn">
            Cancel
          </button>
          </div>

        </div>
      </form>
      </div>
    </>
  );
};

export default RecipeEdit;
