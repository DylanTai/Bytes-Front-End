import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

// Components
import NavBar from "./components/NavBar/NavBar.jsx";

// Pages
import Home from "./pages/Home/Home.jsx";
import SignIn from "./pages/SignIn/SignIn.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import RecipeList from "./pages/RecipeList/RecipeList.jsx";
import RecipeDetail from "./pages/RecipeDetail/RecipeDetail.jsx";
import RecipeForm from "./pages/RecipeForm/RecipeForm.jsx";

// Protected route wrapper
import Protected from "./components/Protected/Protected.jsx";

// Styles
import "./App.css";

// --------------------------
// ROUTER CONFIGURATION
// --------------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <NavBar />
        <Home />
      </>
    ),
  },
  {
    path: "/sign-in",
    element: (
      <>
        <NavBar />
        <SignIn />
      </>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <>
        <NavBar />
        <SignUp />
      </>
    ),
  },
  {
    path: "/recipes",
    element: (
      <Protected>
        <NavBar />
        <RecipeList />
      </Protected>
    ),
  },
  {
    path: "/recipes/:id",
    element: (
      <Protected>
        <NavBar />
        <RecipeDetail />
      </Protected>
    ),
  },
  {
    path: "/recipes/add",
    element: (
      <Protected>
        <NavBar />
        <RecipeForm />
      </Protected>
    ),
  },
]);

// --------------------------
// MAIN APP COMPONENT
// --------------------------
export default function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}
