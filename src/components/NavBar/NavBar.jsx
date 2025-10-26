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
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("token"); // legacy key cleanup
      setUser(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 👇 Control the Hamburger toggle so we can run the close animation
  const handleHamburgerToggle = (nextOpen) => {
    if (nextOpen) {
      // opening
      setIsClosing(false);
      setIsOpen(true);
    } else {
      // closing: keep menu mounted by setting isClosing=true
      setIsClosing(true);
      setIsOpen(false); // let the hamburger icon animate to "closed" immediately
    }
  };

  // 👇 When the closing animation finishes, unmount the menu
  const handleMenuAnimationEnd = (e) => {
    if (e.animationName === "slideUp") {
      setIsClosing(false);
    }
    // (optional) if you need to normalize after opening:
    // if (e.animationName === "slideDown") { /* no-op */ }
  };

  // Optional: close menu when clicking a link (SPA may short-circuit the visual)
  const closeWithAnimation = () => {
    setIsClosing(true);
    setIsOpen(false);
  };

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
      <Link to="/profile" className="nav-link-right">
        Profile
      </Link>
      <Link to="/" onClick={handleSignOut} className="nav-link-right">
        Sign Out
      </Link>
    </>
  );

  const unauthenticatedRight = (
    <>
      <Link to="/sign-up" className="nav-link-right">
        Sign Up
      </Link>
      <Link to="/sign-in" className="nav-link-right">
        Sign In
      </Link>
    </>
  );

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <button
        className="nav-hamburger"
        aria-label="Toggle navigation"
        aria-expanded={isOpen || isClosing}
      >
        <Hamburger toggled={isOpen} toggle={handleHamburgerToggle} size={22} />
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
                onClick={closeWithAnimation}
              >
                Add A Recipe
              </Link>
              <Link
                to="/recipes/AI"
                className="nav-link"
                onClick={closeWithAnimation}
              >
                Generate A Recipe
              </Link>
              <Link
                to="/grocery-list"
                className="nav-link"
                onClick={closeWithAnimation}
              >
                Grocery List
              </Link>
              <Link
                to="/recipe-wheel"
                className="nav-link"
                onClick={closeWithAnimation}
              >
                Recipe Wheel!!!
              </Link>
              <Link
                to="/profile"
                className="nav-link"
                onClick={closeWithAnimation}
              >
                Profile
              </Link>
              <Link
                to="/"
                onClick={() => {
                  handleSignOut();
                  closeWithAnimation();
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
                onClick={closeWithAnimation}
              >
                Sign Up
              </Link>
              <Link
                to="/sign-in"
                className="nav-link"
                onClick={closeWithAnimation}
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
