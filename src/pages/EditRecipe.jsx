
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipe, updateRecipe } from "../services/recipes";

const DEFAULT_TAGS = [
  "Veggie","Vegan","Low Cal","Kosher","High Protein","Nut Free","Dairy Free"
];

export default function EditRecipe() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "", volume: "", weight: "" }]);
  const [steps, setSteps] = useState([{ description: "" }]);
  const [tags, setTags] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getRecipe(recipeId);
        setTitle(data.title || "");
        setNotes(data.notes || "");
        setIngredients((data.ingredients && data.ingredients.length) ? data.ingredients : [{ name: "", quantity: "", volume: "", weight: "" }]);
        setSteps((data.directions && data.directions.length) ? data.directions.map(d=>({description:d.description||d})) : [{ description: "" }]);
        const initialTags = {};
        (data.tags || []).forEach(t => initialTags[t]=true);
        setTags(initialTags);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [recipeId]);

  const addIngredient = () => setIngredients(prev => [...prev, { name: "", quantity: "", volume: "", weight: "" }]);
  const removeIngredient = (idx) => {
    if (ingredients.length <= 1) return;
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };
  const updateIngredient = (idx, field, value) => {
    setIngredients(prev => prev.map((ing, i) => i===idx ? { ...ing, [field]: value } : ing));
  };

  const addStep = () => setSteps(prev => [...prev, { description: "" }]);
  const removeStep = (idx) => {
    if (steps.length <= 1) return;
    setSteps(prev => prev.filter((_, i) => i !== idx));
  };
  const updateStep = (idx, value) => {
    setSteps(prev => prev.map((s, i) => i===idx ? { description: value } : s));
  };

  const toggleTag = (tag) => setTags(prev => ({ ...prev, [tag]: !prev[tag] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      notes,
      ingredients,
      directions: steps.map(s => s.description),
      tags: Object.entries(tags).filter(([k,v])=>v).map(([k])=>k),
    };
    const updated = await updateRecipe(recipeId, payload);
    navigate(`/recipes/${updated.id || updated._id}`);
  };

  return (
    <div>
      <h1>{title || "Edit Recipe"}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: <input value={title} onChange={(e)=>setTitle(e.target.value)} required /></label>
        </div>

        <div>
          <h2>Ingredients</h2>
          {ingredients.map((ing, idx) => (
            <div key={idx}>
              <span>Ingredient: </span>
              <input placeholder="Name" value={ing.name} onChange={(e)=>updateIngredient(idx,"name",e.target.value)} />
              <input placeholder="Quantity" value={ing.quantity} onChange={(e)=>updateIngredient(idx,"quantity",e.target.value)} />
              <input placeholder="Vol" value={ing.volume} onChange={(e)=>updateIngredient(idx,"volume",e.target.value)} />
              <input placeholder="Weight" value={ing.weight} onChange={(e)=>updateIngredient(idx,"weight",e.target.value)} />
              {ingredients.length > 1 && <button type="button" onClick={()=>removeIngredient(idx)}>remove</button>}
            </div>
          ))}
          <button type="button" onClick={addIngredient}>New Ingredient</button>
        </div>

        <div>
          <h2>Steps</h2>
          {steps.map((s, idx) => (
            <div key={idx}>
              <span>Step {idx+1}: </span>
              <input value={s.description} onChange={(e)=>updateStep(idx, e.target.value)} />
              {steps.length > 1 && <button type="button" onClick={()=>removeStep(idx)}>remove</button>}
            </div>
          ))}
          <button type="button" onClick={addStep}>New Step</button>
        </div>

        <div>
          <h2>Tags</h2>
          {DEFAULT_TAGS.map((t)=>(
            <label key={t} style={{marginRight: "8px"}}>
              <input type="checkbox" checked={!!tags[t]} onChange={()=>toggleTag(t)} /> {t}
            </label>
          ))}
        </div>

        <div>
          <h2>Notes</h2>
          <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} />
        </div>

        <div>
          <button type="submit">Save Edit</button>
          <button type="button" onClick={()=>navigate(-1)}>Discard Edit</button>
        </div>
      </form>
    </div>
  );
}
