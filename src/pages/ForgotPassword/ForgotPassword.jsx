import { useState } from "react";
import { Link } from "react-router";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACK_END_SERVER_URL}/users/password-reset/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setEmail(""); // Clear the input
      } else {
        setError(data.email?.[0] || data.error || "Failed to send reset email.");
      }
    } catch (err) {
      console.error("Password reset request failed:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page">
      <h1 className="forgot-password-title">Forgot Password</h1>
      <p className="forgot-password-description">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="sign-form-group">
          <label htmlFor="email" className="sign-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="email-input"
            disabled={loading}
          />
        </div>

        <div className="forgot-password-buttons-container">
          <button type="submit" className="forgot-password-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <Link to="/sign-in" className="back-to-signin-link">
            Back to Sign In
          </Link>
        </div>
      </form>
    </main>
  );
};

export default ForgotPassword;
