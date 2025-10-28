import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    // Frontend validation
    const newErrors = {};
    if (!formData.new_password) {
      newErrors.new_password = "Password is required.";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "Password must be at least 6 characters.";
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACK_END_SERVER_URL}/users/password-reset-confirm/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            token,
            new_password: formData.new_password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        // Redirect to sign-in after 2 seconds
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
      } else {
        setErrors({
          general: data.error || data.new_password?.[0] || "Failed to reset password.",
        });
      }
    } catch (err) {
      console.error("Password reset failed:", err);
      setErrors({ general: "An error occurred. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      <h1 className="reset-password-title">Reset Password</h1>
      <p className="reset-password-description">
        Enter your new password below.
      </p>

      {message && <p className="success-message">{message}</p>}
      {errors.general && <p className="error-message">{errors.general}</p>}

      <form onSubmit={handleSubmit}>
        <div className="sign-form-group">
          <label htmlFor="new_password" className="sign-label">
            New Password:
          </label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            required
            className={`password-input ${errors.new_password ? "input-error" : ""}`}
            disabled={loading}
          />
          {errors.new_password && (
            <p className="field-error">{errors.new_password}</p>
          )}
        </div>

        <div className="sign-form-group">
          <label htmlFor="confirm_password" className="sign-label">
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            className={`password-input ${errors.confirm_password ? "input-error" : ""}`}
            disabled={loading}
          />
          {errors.confirm_password && (
            <p className="field-error">{errors.confirm_password}</p>
          )}
        </div>

        <div className="reset-password-buttons-container">
          <button type="submit" className="reset-password-btn" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default ResetPassword;
