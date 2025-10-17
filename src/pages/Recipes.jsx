
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecipes } from "../services/recipes";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRecipes();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div>
      <h1>Recipes</h1>
      <Link to="/recipes/add">Add Recipe</Link>
      <ul>
        {recipes.map((r) => (
          <li key={r.id || r._id}>
            <Link to={`/recipes/${r.id || r._id}`}>{r.title || "Untitled"}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
