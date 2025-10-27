import { useState } from "react";
import { useNavigate } from "react-router";
import * as userService from "../../services/userService.js";
import "./ForgotPassword.css";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (evt) => {
    setEmail(evt.target.value);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await userService.requestPasswordReset(email);
      setMessage(response.message || "Password reset email sent! Check your inbox.");
      setEmail("");
    } catch (err) {
      console.error("Password reset request failed:", err);
      if (err.response && err.response.data) {
        // Handle specific field errors
        const errors = err.response.data;
        if (errors.email) {
          setError(errors.email.join(", "));
        } else {
          setError(err.message || "Failed to send password reset email.");
        }
      } else {
        setError(err.message || "Failed to send password reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <main className="forgot-password-page">
      <h1 className="forgot-password-title">Forgot Password</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <p className="forgot-password-instructions">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="forgot-form-group">
          <label htmlFor="email" className="forgot-label">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            className="email-input"
          />
        </div>

        <div className="forgot-password-buttons-container">
          <button type="submit" className="forgot-password-btns">Send Reset Link</button>
          <button type="button" onClick={() => navigate("/sign-in")} className="forgot-password-btns">
            Back to Sign In
          </button>
        </div>
      </form>
    </main>
  );
};

export default ForgotPassword;
