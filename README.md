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

- Access code: `admin123` (saved in `dmart_settings/admin`; `VITE_ADMIN_ACCESS_CODE` is the fallback)
- Email: `admin@fakuu.local`
- Password: `admin123`

Emulator UI: http://127.0.0.1:4000

Emulator data is in memory, so after restarting `npm run emulators` run
`npm run seed:emulator` again to recreate the admin user.

## Using a real Firebase project

1. Create a Firebase project and a Web app in the Firebase Console.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Add an admin user under **Authentication → Users**.
4. Paste the web app config into **`src/firebaseConfig.js`** (recommended — it is
   committed, so the deployed site works without dashboard settings):

```js
export const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
};
```

   (Or use `.env` with the `VITE_FIREBASE_*` variables — env values win.)

5. Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

Or paste `firestore.rules` into **Firestore → Rules** in the console.

### Deploying (Vercel / Netlify)

The config now ships in `src/firebaseConfig.js`, so no dashboard variables are
needed. If the file is left empty the build shows a “Firebase configuration
missing” screen instead of crashing with `auth/invalid-api-key`.

Add the deployed domain to **Firebase → Authentication → Settings → Authorized
domains**, otherwise admin sign-in is rejected.

## Admin routes

- Login: `/chutya/nikal/dmart` (access code is stored in Firestore, editable from Store Settings)
- Products: `/products`
- Orders: `/orders`
- Customers: `/customers`
- UPI settings: `/upi-settings`
- Meta Pixel: `/meta-pixel`
- Store settings (access code): `/store-settings`
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

All collections are prefixed with `dmart_` so this app never mixes with other
apps that may share the same Firebase project (`dryfuite` already contains an
unrelated `products` collection).

- `dmart_products/{productId}` — storefront catalogue, managed from Admin → Products.
- `dmart_orders/{orderId}` — customer orders created at checkout.
- `dmart_customers/{mobileDigits}` — address book saved at checkout (`fullName`, `mobile`,
  `cityState`, `pincode`, `fullAddress`, `ordersCount`), listed in Admin → Customers.
- `dmart_carts/{deviceId}` — the cart is mirrored to Firestore for every device (and kept
  in localStorage for instant loading).
- `dmart_settings/metaPixel` — `{ pixels: [{ id, label, enabled }] }`.
- `dmart_settings/upi` — `{ upiId, payeeName }`.
- `dmart_settings/admin` — `{ accessCode }`, used by the admin login screen.

Security rules live in `firestore.rules`. They are intentionally **open**
(anyone can read/write) per request; the file also contains a commented
login-only version you can switch back to.
