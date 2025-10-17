
import { NavLink } from "react-router-dom";

export default function Nav({ user }) {
  return (
    <nav>
      <div className="nav-links">
        <NavLink className="nav-link" to="/">Home</NavLink>
        {user && <NavLink className="nav-link" to="/recipes">Recipes</NavLink>}
        {user && <NavLink className="nav-link" to="/recipes/add">Add Recipe</NavLink>}
        {!user && <NavLink className="nav-link" to="/login">Sign In</NavLink>}
        {!user && <NavLink className="nav-link" to="/register">Sign Up</NavLink>}
        {user && <NavLink className="nav-link" to="/sign-out">Sign Out</NavLink>}
      </div>
    </nav>
  );
}
