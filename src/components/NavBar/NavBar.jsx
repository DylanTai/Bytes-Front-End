import { useContext } from "react";
import { Link } from "react-router";
import { UserContext } from "../../contexts/UserContext";
import "./NavBar.css";

const NavBar = () => {
  const { user, setUser } = useContext(UserContext);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <nav>
      {user ? (
        <>
          <h4>Logged in as {user.username}</h4>
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/" onClick={handleSignOut}>
                Sign Out
              </Link>
            </li>
          </ul>
        </>
      ) : (
        <ul>
          <li>
            <Link to="/sign-up">Sign Up</Link>
          </li>
          <li>
            <Link to="/sign-in">Sign In</Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default NavBar;
