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
      <Link to="/"><button>Home</button></Link>
      <Link to="/recipes/add"><button>Add Recipe</button></Link>
      <Link to="/grocery-list"><button>Grocery List</button></Link>
      <Link to="/profile"><button>Profile</button></Link>
      <Link to="/" onClick={handleSignOut}><button>Sign Out</button></Link>
    </>
  );

  const unauthenticatedOptions = (
    <>
      <Link to="/"><button>Home</button></Link>
      <Link to="/sign-up"><button>Sign Up</button></Link>
      <Link to="/sign-in"><button>Sign In</button></Link>
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
      <div className="nav-links">
        {user ? authenticatedOptions : unauthenticatedOptions}
      </div>
    </nav>
  );
};

export default NavBar;