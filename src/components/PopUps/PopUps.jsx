import { Toaster, toast } from "react-hot-toast";
import "./PopUps.css";

export const showToast = (message, type = "success") => {
  const icon = type === "success" ? "🛒" : "⚠️";

  toast(
    (t) => (
      <div className={`pop-ups pop-ups-${type}`}>
        <span className="pop-ups-icon">{icon}</span>
        <span className="pop-ups-body">{message}</span>
        <button
          className="pop-ups-close-btn"
          onClick={() => toast.dismiss(t.id)}
        >
          ✖
        </button>
      </div>
    ),
    {
      duration: type === "error" ? Infinity : Infinity,
    }
  );
};

export const ConfirmToast = ({ t, message, onConfirm, onCancel }) => (
  <div className="pop-ups pop-ups-confirm">
    <span className="pop-ups-icon">⚠️</span>
    <span className="pop-ups-body">{message}</span>

    <div className="pop-ups-buttons">
      <button
        className="pop-ups-btn confirm"
        onClick={() => {
          onConfirm();
          toast.dismiss(t.id);
        }}
      >
        Yes
      </button>
      <button
        className="pop-ups-btn cancel"
        onClick={() => {
          onCancel();
          toast.dismiss(t.id);
        }}
      >
        No
      </button>
    </div>
  </div>
);

export const showConfirmToast = (message, onConfirm, onCancel) => {
  toast.custom(
    (t) => (
      <ConfirmToast
        t={t}
        message={message}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    ),
    { duration: Infinity }
  );
};

function PopUps() {
  return (
    <Toaster
    position="top-center"
    reverseOrder={false}
    containerStyle={{
        padding: 0,
        margin: 0,
        background: "transparent",
        boxShadow: "none",
    }}
    toastOptions={{
        style: {
          padding: 0,
          margin: 0,
          background: "#d2ee91ff",
          boxShadow: "none",
        },
      }}
    />
  );
}

export default PopUps;
