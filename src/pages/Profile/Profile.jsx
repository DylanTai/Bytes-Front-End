import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "../../contexts/UserContext.jsx";
import * as userService from "../../services/userService.js";
import LoadingAnimation from "../../components/LoadingAnimation/LoadingAnimation.jsx";
import { showToast } from "../../components/PopUps/PopUps.jsx";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Username form state
  const [usernameForm, setUsernameForm] = useState({
    username: user?.username || "",
  });
  const [usernameErrors, setUsernameErrors] = useState({});
  const [usernameSuccess, setUsernameSuccess] = useState("");

  // Email form state
  const [emailForm, setEmailForm] = useState({ email: user?.email || "" });
  const [emailErrors, setEmailErrors] = useState({});
  const [emailSuccess, setEmailSuccess] = useState("");

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteErrors, setDeleteErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // loading animation functions
  const startLoading = () => {
    setLoading(true);
    const timer = setTimeout(() => setShowAnimation(true), 400);
    return timer;
  };

  const stopLoading = (timer) => {
    clearTimeout(timer);
    setLoading(false);
    setShowAnimation(false);
  };

  // Handle username change
  const handleUsernameChange = (e) => {
    setUsernameForm({ username: e.target.value });
    setUsernameErrors({});
    setUsernameSuccess("");
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameErrors({});
    setUsernameSuccess("");
    const timer = startLoading();

    try {
      const result = await userService.updateUsername(usernameForm.username);
      setUsernameSuccess("Username updated successfully!");
      setUser(result.user);
    } catch (error) {
      if (error.response && error.response.data) {
        setUsernameErrors(error.response.data);
      } else {
        setUsernameErrors({
          username: [error.message || "Failed to update username."],
        });
      }
    } finally {
      stopLoading(timer);
    }
  };

  // Handle email change
  const handleEmailChange = (e) => {
    setEmailForm({ email: e.target.value });
    setEmailErrors({});
    setEmailSuccess("");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailErrors({});
    setEmailSuccess("");

    try {
      const result = await userService.updateEmail(emailForm.email);
      setEmailSuccess("Email updated successfully!");
      setUser(result.user);
    } catch (error) {
      if (error.response && error.response.data) {
        setEmailErrors(error.response.data);
      } else {
        setEmailErrors({ email: [error.message || "Failed to update email."] });
      }
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordErrors({});
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess("");
    const timer = startLoading();

    try {
      await userService.updatePassword(passwordForm);
      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      if (error.response && error.response.data) {
        setPasswordErrors(error.response.data);
      } else {
        setPasswordErrors({
          current_password: [error.message || "Failed to update password."],
        });
      }
    } finally {
      stopLoading(timer);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteErrors({});

    if (!deletePassword) {
      setDeleteErrors({
        password: ["Password is required to delete account."],
      });
      return;
    }

    const timer = startLoading();

    try {
      await userService.deleteAccount(deletePassword);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUser(null);
      showToast("Account deleted successfully.", "success");
      navigate("/");
    } catch (error) {
      if (error.response && error.response.data) {
        setDeleteErrors(error.response.data);
      } else {
        setDeleteErrors({
          password: [error.message || "Failed to delete account."],
        });
      }
    } finally {
      stopLoading(timer);
    }
  };

  if (showAnimation) {
    return <LoadingAnimation />;
  }

  return (
    <div className="profile-page">
      <h1 className="profile-title">My Profile</h1>

      {/* Update Username Section */}
      <section className="profile-section">
        <h2>Update Username</h2>
        {usernameSuccess && <p className="success-message">{usernameSuccess}</p>}
        <form onSubmit={handleUsernameSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">New Username:</label>
            <input
              type="text"
              id="username"
              value={usernameForm.username}
              onChange={handleUsernameChange}
              className={usernameErrors.username ? "input-error" : ""}
            />
            {usernameErrors.username && (
              <p className="field-error">{usernameErrors.username.join(", ")}</p>
            )}
          </div>
          <button type="submit" className="submit-button">
            Update Username
          </button>
        </form>
      </section>

      {/* Update Email Section */}
      <section className="profile-section">
        <h2>Update Email</h2>
        {emailSuccess && <p className="success-message">{emailSuccess}</p>}
        <form onSubmit={handleEmailSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">New Email:</label>
            <input
              type="text"
              id="email"
              value={emailForm.email}
              onChange={handleEmailChange}
              className={emailErrors.email ? "input-error" : ""}
            />
            {emailErrors.email && (
              <p className="field-error">{emailErrors.email.join(", ")}</p>
            )}
          </div>
          <button type="submit" className="submit-button">
            Update Email
          </button>
        </form>
      </section>

      {/* Update Password Section */}
      <section className="profile-section">
        <h2>Update Password</h2>
        {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
        <form onSubmit={handlePasswordSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="current_password">Current Password:</label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={passwordForm.current_password}
              onChange={handlePasswordChange}
              className={passwordErrors.current_password ? "input-error" : ""}
            />
            {passwordErrors.current_password && (
              <p className="field-error">{passwordErrors.current_password.join(", ")}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="new_password">New Password:</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange}
              className={passwordErrors.new_password ? "input-error" : ""}
            />
            {passwordErrors.new_password && (
              <p className="field-error">{passwordErrors.new_password.join(", ")}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirm_password">Confirm New Password:</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordChange}
              className={passwordErrors.confirm_password ? "input-error" : ""}
            />
            {passwordErrors.confirm_password && (
              <p className="field-error">{passwordErrors.confirm_password.join(", ")}</p>
            )}
          </div>
          <button type="submit" className="submit-button">
            Update Password
          </button>
        </form>
      </section>

      {/* Delete Account Section */}
      <section className="profile-section danger-section">
        <h2>Delete Account</h2>
        <p className="warning-text">
          This action cannot be undone. All your recipes and data will be permanently deleted.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="danger-button"
          >
            Delete My Account
          </button>
        ) : (
          <div className="delete-confirm">
            <p><strong>Are you sure? Enter your password to confirm:</strong></p>
            <div className="form-group">
              <label htmlFor="new_password">New Password:</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className={passwordErrors.new_password ? "input-error" : ""}
              />
              {passwordErrors.new_password && (
                <p className="field-error">
                  {passwordErrors.new_password.join(", ")}
                </p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirm_password">Confirm New Password:</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                className={passwordErrors.confirm_password ? "input-error" : ""}
              />
              {passwordErrors.confirm_password && (
                <p className="field-error">
                  {passwordErrors.confirm_password.join(", ")}
                </p>
              )}
            </div>
            <button type="submit" className="submit-button">
              Update Password
            </button>
          </form>
        </section>

        {/* Delete Account Section */}
        <section className="profile-section danger-section">
          <h2>Delete Account</h2>
          <p className="warning-text">
            This action cannot be undone. All your recipes and data will be
            permanently deleted.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="danger-button"
            >
              Delete My Account
            </button>
          ) : (
            <div className="delete-confirm">
              <p>
                <strong>Are you sure? Enter your password to confirm:</strong>
              </p>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteErrors({});
                  }}
                  className={deleteErrors.password ? "input-error" : ""}
                />
                {deleteErrors.password && (
                  <p className="field-error">
                    {deleteErrors.password.join(", ")}
                  </p>
                )}
              </div>
              <div className="delete-buttons">
                <button onClick={handleDeleteAccount} className="danger-button">
                  Confirm Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword("");
                    setDeleteErrors({});
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
