import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { signIn } from "../../services/authService.js";
import { UserContext } from "../../contexts/UserContext.jsx";
import "./SignIn.css";
import "../../utils/formError/formErrors.css";

const SignInForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({ general: [], fields: {} });

  const createEmptyErrors = () => ({ general: [], fields: {} });

  const hasErrors = (errorState) => {
    if (!errorState) return false;
    if (errorState.general?.length) return true;
    return Object.values(errorState.fields || {}).some(
      (messages) => Array.isArray(messages) && messages.length > 0
    );
  };

  const addFieldError = (errorState, field, message) => {
    if (!errorState.fields[field]) {
      errorState.fields[field] = [];
    }
    errorState.fields[field].push(message);
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const hasFieldError = prev.fields?.[name]?.length;
      const hasGeneralError = prev.general?.length;
      if (!hasFieldError && !hasGeneralError) return prev;
      const next = {
        general: [],
        fields: { ...(prev.fields || {}) },
      };
      delete next.fields[name];
      return next;
    });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    const validationErrors = createEmptyErrors();

    if (!formData.username.trim()) {
      addFieldError(validationErrors, "username", "Username is required.");
    }

    if (!formData.password) {
      addFieldError(validationErrors, "password", "Password is required.");
    }

    try {
      if (hasErrors(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      const user = await signIn(formData);
      setUser(user);
      navigate("/");
    } catch (err) {
      console.error("Sign-in failed:", err);
      const backendErrors = createEmptyErrors();
      const apiError = err?.response?.data;

      if (apiError && typeof apiError === "object") {
        Object.entries(apiError).forEach(([field, value]) => {
          const message =
            Array.isArray(value) && value.length
              ? String(value[0])
              : typeof value === "string"
              ? value
              : null;

          if (message) {
            if (field === "detail" || field === "non_field_errors") {
              addFieldError(backendErrors, "username", message);
              addFieldError(backendErrors, "password", message);
            } else {
              addFieldError(backendErrors, field, message);
            }
          }
        });
      } else {
        const fallback = err?.message || "Invalid username or password.";
        addFieldError(backendErrors, "username", fallback);
        addFieldError(backendErrors, "password", fallback);
      }

      setErrors(backendErrors);
      setFormData({ username: "", password: "" });
    }
  };

  return (
    <main className="sign-in-page">
      <h1 className="sign-in-title">Sign In</h1>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className={`username-input ${
              errors.fields?.username?.length ? "input-error" : ""
            }`}
            placeholder={errors.fields?.username?.[0] || ""}
            aria-invalid={errors.fields?.username?.length ? "true" : "false"}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`password-input ${
              errors.fields?.password?.length ? "input-error" : ""
            }`}
            placeholder={errors.fields?.password?.[0] || ""}
            aria-invalid={errors.fields?.password?.length ? "true" : "false"}
          />
        </div>

        <div className="sign-in-buttons">
          <button type="submit">Sign In</button>
          <button type="button" onClick={() => navigate("/")}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

export default SignInForm;
