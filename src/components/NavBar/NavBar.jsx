import { useContext, useState, useEffect } from "react";
import { Link } from "react-router";
import { UserContext } from "../../contexts/UserContext";
import "./NavBar.css";
import { Squash as Hamburger } from "hamburger-react";
import logo from "../../../assets/Bytes AI.png";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const toggleMobileMenu = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 400); // match CSS animation duration
    } else {
      setIsOpen(true);
    }
  };

  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const authenticatedLeft = (
    <>
      <Link to="/recipes/add" className="nav-link">
        Add Recipe
      </Link>
      <Link to="/recipes/AI" className="nav-link">
        Generate A Recipe!
      </Link>
      <Link to="/grocery-list" className="nav-link">
        Grocery List
      </Link>
      <Link to="/recipe-wheel" className="nav-link">
        Recipe Wheel
      </Link>
    </>
  );

  const authenticatedRight = (
    <>
      <Link to="/profile" className="nav-link">
        Profile
      </Link>
      <Link to="/" onClick={handleSignOut} className="nav-link">
        Sign Out
      </Link>
    </>
  );

  const unauthenticatedRight = (
    <>
      <Link to="/sign-up" className="nav-link">
        Sign Up
      </Link>
      <Link to="/sign-in" className="nav-link">
        Sign In
      </Link>
    </>
  );

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
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

      <div className="nav-left">{user ? authenticatedLeft : null}</div>

      <div className="nav-center">
        <Link to="/">
          <img src={logo} alt="logo" />
        </Link>
      </div>

      <div className={`nav-right ${isOpen ? "open" : ""}`}>
        {user ? authenticatedRight : unauthenticatedRight}
      </div>

      {(isOpen || isClosing) && (
        <div className={`mobile-menu ${isClosing ? "closing" : "opening"}`}>
          {user ? (
            <>
              <Link
                to="/recipes/add"
                className="nav-link"
                onClick={handleCloseMenu}
              >
                Add A Recipe
              </Link>
              <Link
                to="/recipes/AI"
                className="nav-link"
                onClick={handleCloseMenu}
              >
                Generate A Recipe
              </Link>
              <Link
                to="/grocery-list"
                className="nav-link"
                onClick={handleCloseMenu}
              >
                Grocery List
              </Link>
              <Link
                to="/recipe-wheel"
                className="nav-link"
                onClick={handleCloseMenu}
              >
                Recipe Wheel!!!
              </Link>
              <Link
                to="/profile"
                className="nav-link"
                onClick={handleCloseMenu}
              >
                Profile
              </Link>
              <Link
                to="/"
                onClick={() => {
                  handleSignOut();
                  handleCloseMenu();
                }}
                className="nav-link"
              >
                Sign Out
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/sign-up"
                className="nav-link"
                onClick={handleCloseMenu}
              >
                Sign Up
              </Link>
              <Link
                to="/sign-in"
                className="nav-link"
                onClick={handleCloseMenu}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
