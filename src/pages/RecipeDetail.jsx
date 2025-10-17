
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getRecipe, deleteRecipe } from "../services/recipes";

export default function RecipeDetail() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRecipe(recipeId);
        setRecipe(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [recipeId]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this recipe?")) return;
    await deleteRecipe(recipeId);
    navigate("/recipes");
  };

  if (!recipe) return <div>Loading...</div>;

  return (
    <div>
      <h1>{recipe.title}</h1>
      {recipe.notes && <p>{recipe.notes}</p>}
      <div>
        <Link to={`/recipes/${recipeId}/edit`}>Edit</Link>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}
