import { Toaster } from "react-hot-toast";
import "./PopUps.css";

function PopUps() {
  return (
    <Toaster
      position="top-center"
      autoClose={3000}
      closeOnClick
      draggable
      hideProgressBar={true}
      pauseOnHover
      theme="colored"

      toastClassName="pop-ups"
      bodyClassName="pop-ups-body"
      progressClassName="pop-ups-progress"

      toastOptions={{
        duration: Infinity,
        success: {
          iconTheme: {
            primary: "#4CAF50",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#F44336",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}

export default PopUps;
