# BegBasket Frontend

React + Vite storefront with a Firebase-only backend (Firestore + Firebase Auth).
There is no Express/MongoDB server anymore.

## Local development (Firebase Emulator Suite)

No Firebase project is required for local development. The app connects to the
local Firebase emulators.

```bash
npm install

# terminal 1 - Auth (9099) + Firestore (8080) + Emulator UI (4000)
npm run emulators

# terminal 2 - create the local admin account
npm run seed:emulator

# terminal 3 - start the app
npm run dev
```

Open http://localhost:5173

Local admin login:

- Access code: `admin123` (from `VITE_ADMIN_ACCESS_CODE`)
- Email: `admin@fakuu.local`
- Password: `admin123`

Emulator UI: http://127.0.0.1:4000

Emulator data is in memory, so after restarting `npm run emulators` run
`npm run seed:emulator` again to recreate the admin user.

## Using a real Firebase project

1. Create a Firebase project and a Web app in the Firebase Console.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Add an admin user under **Authentication → Users**.
4. Copy the web app config into `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_USE_FIREBASE_EMULATOR=false
VITE_ADMIN_ACCESS_CODE=your-access-code
```

5. Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

Or paste `firestore.rules` into **Firestore → Rules** in the console.

### Deploying (Vercel / Netlify)

Build-time variables must be added in the hosting dashboard — `.env` is
gitignored, so a deployment without them shows a “Firebase configuration
missing” screen instead of crashing with `auth/invalid-api-key`.

Vercel: **Settings → Environment Variables** → add every `VITE_*` variable
above → **Deployments → Redeploy** (env changes only apply to new builds).
Also add the deployed domain to **Firebase → Authentication → Settings →
Authorized domains**, otherwise admin sign-in is rejected.

## Admin routes

- Login: `/chutya/nikal/dmart`
- Products: `/products`
- Orders: `/orders`
- UPI settings: `/upi-settings`
- Meta Pixel: `/meta-pixel`
- User settings: `/user-settings`

## Products

The catalogue lives in Firestore (`products/{id}`) and is fully managed from
**Admin → Products** (add, edit, hide/show, delete, reorder).

- `products.json` (project root) and `src/data/products.json` hold the original
  14-product catalogue that ships with the site.
- On a fresh project the storefront falls back to that bundled catalogue until
  products exist in Firestore.
- **Admin → Products → “Import starter catalogue”** copies the bundled
  catalogue into Firestore in one click.

## Data model

- `products/{productId}` — storefront catalogue, publicly readable, admin writable.
- `orders/{orderId}` — customer order documents created by visitors.
- `settings/metaPixel` — `{ pixels: [{ id, label, enabled }] }`, publicly readable, admin writable.
- `settings/upi` — `{ upiId, payeeName }`, publicly readable, admin writable.

Security rules live in `firestore.rules`.
