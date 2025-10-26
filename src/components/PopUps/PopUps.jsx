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
      duration: type === "error" ? Infinity : 3000,
    }
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
          background: "white",
          boxShadow: "none",
        },
      }}
    />
  );
}

export default PopUps;
