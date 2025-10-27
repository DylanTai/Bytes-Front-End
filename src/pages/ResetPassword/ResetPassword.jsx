import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as userService from "../../services/userService.js";
import "./ResetPassword.css";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (evt) => {
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
    setMessage("");
    setErrors({});
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const response = await userService.confirmPasswordReset(
        uid,
        token,
        formData.new_password,
        formData.confirm_password
      );
      setMessage(response.message || "Password reset successfully! Redirecting to sign in...");

      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    } catch (err) {
      console.error("Password reset failed:", err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: [err.message || "Failed to reset password."] });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <main className="reset-password-page">
      <h1 className="reset-password-title">Reset Password</h1>

      {message && <p className="success-message">{message}</p>}
      {errors.general && <p className="error-message">{errors.general.join(", ")}</p>}
      {errors.uid && <p className="error-message">{errors.uid.join(", ")}</p>}
      {errors.token && <p className="error-message">{errors.token.join(", ")}</p>}

      <form autoComplete="off" onSubmit={handleSubmit}>
        <div className="reset-form-group">
          <label htmlFor="new_password" className="reset-label">New Password:</label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            required
            className={`password-input ${errors.new_password ? "input-error" : ""}`}
          />
          {errors.new_password && (
            <p className="field-error">{errors.new_password.join(", ")}</p>
          )}
        </div>

        <div className="reset-form-group">
          <label htmlFor="confirm_password" className="reset-label">Confirm Password:</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            className={`password-input ${errors.confirm_password ? "input-error" : ""}`}
          />
          {errors.confirm_password && (
            <p className="field-error">{errors.confirm_password.join(", ")}</p>
          )}
        </div>

        <div className="reset-password-buttons-container">
          <button type="submit" className="reset-password-btns">Reset Password</button>
          <button type="button" onClick={() => navigate("/sign-in")} className="reset-password-btns">
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

export default ResetPassword;
