import { NavLink } from "react-router-dom";
import headerLogo from "../assets/header-logo.svg"

function Nav({ user }) {
  const authenticatedOptions = (
    <>
      <NavLink className="nav-link" to="/cats">
        Cats
      </NavLink>
      <NavLink className="nav-link" to="/toys">
        Toys
      </NavLink>
      <NavLink className="nav-link" to="/cats/add">
        Add Cat
      </NavLink>
      <NavLink className="nav-link" to="/toys/add">
        Add Toy
      </NavLink>
      <NavLink className="nav-link" to="/sign-out">
        Log Out
      </NavLink>
    </>
  );

  const unauthenticatedOptions = (
    <>
      <NavLink className="nav-link" to="/">
        Log-In
      </NavLink>
      <NavLink className="nav-link" to="/register">
        Register
      </NavLink>
    </>
  );

  return (
    <nav>
      <img src={headerLogo} alt="header cat" />
      {user && <div className="link welcome">Welcome, {user.username}</div>}
      <div className="nav-links">
        {user ? authenticatedOptions : unauthenticatedOptions}
      </div>
    </nav>
  );
}

export default Nav;
