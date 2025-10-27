import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router";
import { signIn } from "../../services/authService.js";
import { UserContext } from "../../contexts/UserContext.jsx";
import "./SignIn.css";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";

const SignInForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
   const [loading, setLoading] = useState(false);

  const handleChange = (evt) => {
    setMessage("");
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    try {
      const user = await signIn(formData);
      setUser(user);
      navigate("/");
    } catch (err) {
      console.error("Sign-in failed:", err);
      setMessage(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <main className="sign-in-page">
      <h1 className="sign-in-title">Sign In</h1>
      {message && <p className="error-message">{message}</p>}

      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="sign-form-group">
          <label htmlFor="username" className="sign-label">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="username-input"
          />
        </div>

        <div className="sign-form-group">
          <label htmlFor="password" className="sign-label">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="password-input"
          />
        </div>

        <div className="forgot-password-link-container">
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </Link>
        </div>

        <div className="sign-in-buttons-container">
          <button type="submit" className="sign-in-btns">Sign In</button>
          <button type="button" onClick={() => navigate("/")} className="sign-in-btns">
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

export default SignInForm;
