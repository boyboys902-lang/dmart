import { getCartDoc, saveCartDoc } from "./firestoreApi";

const CART_KEY = "basket_cart";
const DEVICE_KEY = "basket_device_id";

export const getDeviceId = () => {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "unknown-device";
  }
};

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};

// Writes the cart to localStorage (instant) and mirrors it to Firestore
// collection `carts/{deviceId}` in the background.
const persist = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* storage full / private mode */
  }

  saveCartDoc(getDeviceId(), cart).catch((err) => {
    console.warn("Cart could not be saved to Firestore:", err);
  });

  return cart;
};

export const addToCart = (product, qty = 1) => {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      img: product.img,
      title: product.title,
      offer_price: product.offer_price,
      original_price: product.original_price,
      discount: product.discount,
      qty,
    });
  }
  return persist(cart);
};

export const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item.id !== productId);
  return persist(cart);
};

export const updateCartQty = (productId, qty) => {
  if (qty <= 0) return removeFromCart(productId);
  const cart = getCart().map((item) =>
    item.id === productId ? { ...item, qty } : item
  );
  return persist(cart);
};

export const getCartCount = () => {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
};

export const getCartTotal = () => {
  return getCart().reduce((sum, item) => {
    const price = parseFloat(String(item.offer_price).replace(/[^0-9.]/g, "")) || 0;
    return sum + price * item.qty;
  }, 0);
};

export const clearCart = () => persist([]);

// Called once on app start: restores a cart saved in Firestore on this device
// (or pushes the local cart up if Firestore has nothing yet).
export const syncCartWithFirestore = async () => {
  try {
    const local = getCart();
    const remote = await getCartDoc(getDeviceId());

    if (Array.isArray(remote) && remote.length > 0 && local.length === 0) {
      localStorage.setItem(CART_KEY, JSON.stringify(remote));
    } else if (local.length > 0) {
      await saveCartDoc(getDeviceId(), local);
    }
  } catch (err) {
    console.warn("Cart sync with Firestore failed:", err);
  }
};
