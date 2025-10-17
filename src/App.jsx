
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { verifyUser } from "./services/users";
import Nav from "./components/Nav";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Register from "./pages/Register";
import SignOut from "./pages/SignOut.jsx";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await verifyUser();
      setUser(u || null);
    })();
  }, []);

  return (
    <>
      <Nav user={user} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Home />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/sign-out" element={<SignOut setUser={setUser} />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/add" element={<CreateRecipe />} />
        <Route path="/recipes/:recipeId/edit" element={<EditRecipe />} />
        <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
      </Routes>
    </>
  );
}
