import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import MissingConfigScreen from "./components/FirebaseConfigMissing.jsx";
import { isFirebaseConfigured } from "./firebase.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isFirebaseConfigured ? <App /> : <MissingConfigScreen />}
  </StrictMode>,
);
