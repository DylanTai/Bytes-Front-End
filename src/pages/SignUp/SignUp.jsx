import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { signUp } from "../../services/authService.js";
import { UserContext } from "../../contexts/UserContext.jsx";
import "./SignUp.css";
import "../../utils/formError/formErrors.css";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const { username, email, password, password2 } = formData;

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = ["Username is required."];
    } else if (username.length < 3) {
      newErrors.username = ["Username must be at least 3 characters."];
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = ["Email is required."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ["Enter a valid email address."];
    }

    // Password validation
    if (!password) {
      newErrors.password = ["Password is required."];
    } else if (password.length < 6) {
      newErrors.password = ["Password must be at least 6 characters."];
    }

    // Confirm password validation
    if (!password2) {
      newErrors.password2 = ["Please confirm your password."];
    } else if (password !== password2) {
      newErrors.password2 = ["Passwords do not match."];
    }

    return newErrors;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    
    // Get frontend validation errors
    const frontendErrors = validateForm();
    
    // Always try to submit to get backend errors too
    try {
      const newUser = await signUp(formData);
      setUser(newUser);
      navigate("/");
    } catch (error) {
      console.error("Sign-up failed:", error);
      
      // Combine frontend and backend errors
      let allErrors = { ...frontendErrors };
      
      // Handle Django validation errors
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Check if it's field-specific errors
        if (typeof errorData === 'object' && !errorData.detail) {
          // Merge backend errors with frontend errors
          Object.keys(errorData).forEach(field => {
            if (!allErrors[field]) {
              allErrors[field] = errorData[field];
            }
          });
        } else {
          // Generic error message
          if (!allErrors.username) {
            allErrors.username = [errorData.detail || error.message || "Failed to create account."];
          }
        }
      } else {
        if (!allErrors.username) {
          allErrors.username = [error.message || "Failed to create account."];
        }
      }
      
      setErrors(allErrors);
    }
  };

  return (
    <main className="sign-up-page">
      <h1 className="sign-up-title">Sign Up</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="signup-section">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            name="username"
            onChange={handleChange}
            className={`username-input ${errors.username ? "input-error" : ""}`}
            placeholder={errors.username ? errors.username[0] : ""}
            aria-invalid={errors.username ? "true" : "false"}
          />
        </div>
        <div className="signup-section">
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            id="email"
            value={email}
            name="email"
            onChange={handleChange}
            className={`email-input ${errors.email ? "input-error" : ""}`}
            placeholder={errors.email ? errors.email[0] : ""}
            aria-invalid={errors.email ? "true" : "false"}
          />
        </div>
        <div className="signup-section">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            name="password"
            onChange={handleChange}
            className={`password-input ${errors.password ? "input-error" : ""}`}
            placeholder={errors.password ? errors.password[0] : ""}
            aria-invalid={errors.password ? "true" : "false"}
          />
        </div>
        <div className="signup-section">
          <label htmlFor="password2">Confirm Password:</label>
          <input
            type="password"
            id="password2"
            value={password2}
            name="password2"
            onChange={handleChange}
            className={`confirm-input ${errors.password2 ? "input-error" : ""}`}
            placeholder={errors.password2 ? errors.password2[0] : ""}
            aria-invalid={errors.password2 ? "true" : "false"}
          />
        </div>
        <div className="sign-up-buttons">
          <button type="submit">
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
