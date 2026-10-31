// Creates the local admin account in the Firebase Auth emulator.
// Usage: npm run seed:emulator (emulators must already be running)

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fakuu.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const URL =
  "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key";

const run = async () => {
  let response;
  try {
    response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        returnSecureToken: true,
      }),
    });
  } catch {
    console.error(
      "Auth emulator is not reachable. Start it first with `npm run emulators`."
    );
    process.exit(1);
  }

  const data = await response.json();

  if (response.ok) {
    console.log("Admin user created in Auth emulator");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    return;
  }

  if (data?.error?.message === "EMAIL_EXISTS") {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    return;
  }

  console.error("Failed to create admin:", data?.error?.message || data);
  process.exit(1);
};

run();
