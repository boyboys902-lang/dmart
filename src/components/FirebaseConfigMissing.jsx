import { missingFirebaseKeys } from "../firebase.js";

const MissingConfigScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        Firebase configuration missing
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        The build has no Firebase project configured, so sign-in, products and
        orders cannot load. Paste your Firebase web app config into{" "}
        <code className="font-mono text-xs">src/firebaseConfig.js</code> (or set the
        VITE_FIREBASE_* environment variables) and rebuild/redeploy.
      </p>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Missing variables
      </p>
      <ul className="mb-5 space-y-1 rounded-lg bg-red-50 border border-red-200 p-3">
        {missingFirebaseKeys.map((key) => (
          <li key={key} className="font-mono text-xs text-red-700">
            {key.startsWith("VITE_")
              ? key
              : `VITE_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`}
          </li>
        ))}
      </ul>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Where to get them
      </p>
      <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1 mb-5">
        <li>Firebase Console → Project settings (⚙) → Your apps → Web app</li>
        <li>
          Copy the <code className="font-mono text-xs">firebaseConfig</code> values
        </li>
        <li>
          Paste them into <code className="font-mono text-xs">src/firebaseConfig.js</code>{" "}
          (or Vercel → Settings → Environment Variables)
        </li>
        <li>Rebuild / Redeploy (env changes only apply to new builds)</li>
      </ol>

      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer font-semibold text-gray-800">
          Full list to copy
        </summary>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 text-gray-100 text-xs p-3 leading-relaxed">
{`VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_FIREBASE_EMULATOR=false
VITE_ADMIN_ACCESS_CODE=`}
        </pre>
      </details>
    </div>
  </div>
);

export default MissingConfigScreen;
