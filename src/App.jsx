import React, { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

// Components
import NavBar from "./components/NavBar/NavBar.jsx";

// Pages
import Home from "./pages/Home/Home.jsx";
import SignIn from "./pages/SignIn/SignIn.jsx";
import SignUp from "./pages/SignUp/SignUp.jsx";
import RecipeList from "./pages/RecipeList/RecipeList.jsx";
import RecipeDetail from "./pages/RecipeDetail/RecipeDetail.jsx";
import RecipeEdit from "./pages/RecipeEdit/RecipeEdit.jsx";
import RecipeForm from "./pages/RecipeForm/RecipeForm.jsx";
import GroceryList from "./pages/GroceryList/GroceryList.jsx";
import RecipeWheel from "./pages/RecipeWheel/RecipeWheel.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import RecipeAi from "./pages/RecipeAi/RecipeAi.jsx";

// Protected route wrapper
import Protected from "./components/Protected/Protected.jsx";

// Context
import { UserContext } from "./contexts/UserContext.jsx";

// Services
import * as authService from "./services/authService.js";
import * as userService from "./services/userService.js";

// Styles
import "./App.css";

// ROUTER CONFIGURATION
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
    path: "/recipes/:recipeId/edit",
    element: (
      <Protected>
        <NavBar />
        <RecipeEdit />
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
  {
    path: "/grocery-list",
    element: (
      <Protected>
        <NavBar />
        <GroceryList />
      </Protected>
    ),
  },
  {
    path: "/recipe-wheel",
    element: (
      <Protected>
        <NavBar />
        <RecipeWheel />
      </Protected>
    ),
  },
  {
    path: "/profile",
    element: (
      <Protected>
        <NavBar />
        <Profile />
      </Protected>
    ),
  },
]);

// MAIN APP COMPONENT
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const access = localStorage.getItem("access");
      if (access) {
        try {
          const userData = await userService.getUser();
          setUser(userData);
        } catch (error) {
          // Token invalid or expired, try refresh
          try {
            await authService.refreshAccessToken();
            const userData = await userService.getUser();
            setUser(userData);
          } catch (refreshError) {
            // Refresh failed, clear storage
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="App">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </UserContext.Provider>
  );
}
