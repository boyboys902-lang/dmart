import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from "./firebaseConfig.js";

// Hard-coded config (src/firebaseConfig.js) is used unless a VITE_* env var
// is present, so the site works both ways.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || FIREBASE_CONFIG.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || FIREBASE_CONFIG.appId,
};

const REQUIRED_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

export const missingFirebaseKeys = REQUIRED_KEYS.filter((key) => !firebaseConfig[key]);
export const isFirebaseConfigured = missingFirebaseKeys.length === 0;

// The emulator switch is opt-in only: never let a production build silently
// point at localhost.
const useEmulator =
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true" ||
  (import.meta.env.DEV && !(firebaseConfig.apiKey || "").startsWith("AIza"));

let authInstance = null;
let dbInstance = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);

  authInstance = getAuth(app);
  dbInstance = getFirestore(app);

  if (useEmulator) {
    if (import.meta.env.DEV) {
      connectAuthEmulator(authInstance, "http://127.0.0.1:9099", {
        disableWarnings: true,
      });
      connectFirestoreEmulator(dbInstance, "127.0.0.1", 8080);
    } else {
      console.warn(
        "[Firebase] Emulator flag is on in a production build — using the real Firebase project instead."
      );
    }
  }
} else {
  console.error(
    `[Firebase] Missing configuration: ${missingFirebaseKeys.join(", ")}.\n` +
      "Add them to src/firebaseConfig.js (hard-coded) or as VITE_FIREBASE_* environment variables, then rebuild."
  );
}

export const auth = authInstance;
export const db = dbInstance;
