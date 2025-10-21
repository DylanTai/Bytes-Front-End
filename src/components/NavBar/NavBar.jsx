import { useContext, useState } from "react";
import { Link } from "react-router";
import { UserContext } from "../../contexts/UserContext";
import "./NavBar.css";
import { Squash as Hamburger } from "hamburger-react";
import logo from "../../../assets/Bytes.png";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const toggleMobileMenu = () => setIsOpen((prev) => !prev);

  const authenticatedOptions = (
    <>
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/recipes/add" className="nav-link">Add Recipe</Link>
      <Link to="/grocery-list" className="nav-link">Grocery List</Link>
      <Link to="/profile" className="nav-link">Profile</Link>
      <Link to="/" onClick={handleSignOut} className="nav-link">Sign Out</Link>
    </>
  );

  const unauthenticatedOptions = (
    <>
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/sign-up" className="nav-link">Sign Up</Link>
      <Link to="/sign-in" className="nav-link">Sign In</Link>
    </>
  );

  return (
    <nav>
      <div className="nav-img">
        <Link to="/">
          <img src={logo} alt="logo" />
        </Link>
      </div>
      <button
        className="nav-hamburger"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
      >
        <Hamburger
          onClick={toggleMobileMenu}
          toggled={isOpen}
          toggle={setIsOpen}
          size={22}
        />
      </button>
      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        {user ? authenticatedOptions : unauthenticatedOptions}
      </div>
    </nav>
  );
};

export default NavBar;