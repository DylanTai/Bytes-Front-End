import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { signUp } from "../../services/authService.js";
import { UserContext } from "../../contexts/UserContext.jsx";
import "./SignUp.css";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const { username, email, password, password2 } = formData;

  const handleChange = (evt) => {
    setMessage("");
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    if (password !== password2) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const newUser = await signUp(formData);
      setUser(newUser);
      navigate("/");
    } catch (error) {
      console.error("Sign-up failed:", error);
      setMessage(error.message || "Failed to create account.");
    }
  };

  const isFormInvalid = () => {
    return !(username && email && password && password === password2);
  };

  return (
    <main className="sign-up-page">
      <h1 className="sign-up-title">Sign Up</h1>
      {message && <p className="error-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="sign-up-section">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            name="username"
            onChange={handleChange}
            required
            className="username-input"
          />
        </div>

        <div className="sign-up-section">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            name="email"
            onChange={handleChange}
            required
            className="email-input"
          />
        </div>

        <div className="sign-up-section">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            name="password"
            onChange={handleChange}
            required
            className="password-input"
          />
        </div>

        <div className="sign-up-section">
          <label htmlFor="password2">Confirm Password:</label>
          <input
            type="password"
            id="password2"
            value={password2}
            name="password2"
            onChange={handleChange}
            required
            className="confirm-input"
          />
        </div>

        <div className="sign-up-buttons">
          <button type="submit" disabled={isFormInvalid()}>
            Sign Up
          </button>
          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

export default SignUpForm;
