import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

let authInstance = null;
let dbInstance = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);

  authInstance = getAuth(app);
  dbInstance = getFirestore(app);

  // Local development without a real Firebase project:
  // set VITE_USE_FIREBASE_EMULATOR=true and run `npm run emulators`.
  // Never used in production builds — they must talk to the real project.
  if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
    if (import.meta.env.DEV) {
      connectAuthEmulator(authInstance, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(dbInstance, "127.0.0.1", 8080);
    } else {
      console.warn(
        "[Firebase] VITE_USE_FIREBASE_EMULATOR is on in a production build — using the real Firebase project instead."
      );
    }
  }
} else {
  console.error(
    `[Firebase] Missing configuration: ${missingFirebaseKeys.join(", ")}.\n` +
      "Add the VITE_FIREBASE_* variables in your hosting dashboard (Vercel → Settings → Environment Variables) " +
      "and redeploy — environment variables are applied only on new builds."
  );
}

export const auth = authInstance;
export const db = dbInstance;
