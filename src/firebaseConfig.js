// ─────────────────────────────────────────────────────────────────────────────
// Firebase web app config (hard-coded so the deployed build works without
// setting Vercel/Netlify environment variables).
//
// Paste the values from:
//   Firebase Console → Project settings (⚙) → Your apps → Web app → SDK setup
//
// This config is NOT a secret — Firebase web configs are public by design
// (they are shipped in every browser bundle). Access is controlled by
// Firestore rules, not by hiding these values.
// ─────────────────────────────────────────────────────────────────────────────

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhhPpDjB4XgstADqjh9bZP8qWu4RrIU0Q",
  authDomain: "dryfuite.firebaseapp.com",
  projectId: "dryfuite",
  storageBucket: "dryfuite.firebasestorage.app",
  messagingSenderId: "869245340647",
  appId: "1:869245340647:web:1ea7ce45a9dfaf34c80b42",
};

// Optional: environment variables still win when they are set, so nothing
// breaks if you later prefer the dashboard approach.
export default FIREBASE_CONFIG;
