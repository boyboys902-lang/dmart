import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_UPI_SETTINGS } from "./upi";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";
const SETTINGS_COLLECTION = "settings";
const META_PIXEL_DOC = "metaPixel";
const UPI_SETTINGS_DOC = "upi";

export const ORDER_STATUSES = ["Pending", "Completed", "Cancelled"];

const toIsoString = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const serializeOrder = (snapshot) => {
  const data = snapshot.data();
  return {
    ...data,
    _id: snapshot.id,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
};

export const createOrder = async (payload) => {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...payload,
    quantity: Number(payload.quantity),
    totalAmount: Number(payload.totalAmount),
    status: "Pending",
    isSuspicious: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Customers are not allowed to read order documents back (only the admin
  // can), so do not getDoc() here — that would throw permission-denied even
  // though the order was created successfully.
  return {
    ...payload,
    quantity: Number(payload.quantity),
    totalAmount: Number(payload.totalAmount),
    status: "Pending",
    isSuspicious: false,
    _id: docRef.id,
  };
};

export const getOrders = async () => {
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map(serializeOrder);
};

export const getOrder = async (orderId) => {
  if (!orderId) throw new Error("Order number is required");

  const snapshot = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
  if (!snapshot.exists()) throw new Error("Order not found");

  return serializeOrder(snapshot);
};

export const updateOrderStatus = async (orderId, status) => {
  if (!orderId) throw new Error("Order number is required");
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error("Valid status (Pending, Completed, Cancelled) is required");
  }

  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });

  const snapshot = await getDoc(orderRef);
  return serializeOrder(snapshot);
};

export const deleteOrders = async (orderIds) => {
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new Error("An array of order IDs is required");
  }

  const batch = writeBatch(db);
  orderIds.forEach((id) => batch.delete(doc(db, ORDERS_COLLECTION, id)));
  await batch.commit();

  return { deletedCount: orderIds.length };
};

// ── Meta Pixel ────────────────────────────────────────────────────────────

// Accepts either a bare pixel ID or a full Meta Pixel snippet and pulls out
// every pixel ID found inside it (so pasting the whole code block works).
export const extractPixelIds = (value) => {
  const matches = (value || "").match(/\d{10,20}/g) || [];
  return [...new Set(matches)];
};

const normalizePixel = (pixel, index) => ({
  id: String(pixel?.id || "").trim(),
  label: String(pixel?.label || "").trim() || `Pixel ${index + 1}`,
  enabled: pixel?.enabled !== false,
});

export const getMetaPixels = async () => {
  const snapshot = await getDoc(doc(db, SETTINGS_COLLECTION, META_PIXEL_DOC));
  const data = snapshot.exists() ? snapshot.data() : {};

  if (Array.isArray(data.pixels)) {
    const pixels = data.pixels
      .map(normalizePixel)
      .filter((pixel) => /^\d{10,20}$/.test(pixel.id));
    return { pixels };
  }

  // Backwards compatibility: the old version stored one raw code block.
  const legacyIds = extractPixelIds(data.pixelCode || "");
  return {
    pixels: legacyIds.map((id, index) =>
      normalizePixel({ id, label: `Pixel ${index + 1}` }, index)
    ),
  };
};

export const saveMetaPixels = async (pixels) => {
  const clean = (pixels || [])
    .map(normalizePixel)
    .filter((pixel) => /^\d{10,20}$/.test(pixel.id));

  const seen = new Set();
  const unique = clean.filter((pixel) => {
    if (seen.has(pixel.id)) return false;
    seen.add(pixel.id);
    return true;
  });

  await setDoc(
    doc(db, SETTINGS_COLLECTION, META_PIXEL_DOC),
    { pixels: unique, updatedAt: serverTimestamp() },
    { merge: true }
  );

  return { pixels: unique };
};

export const getUpiSettings = async () => {
  const snapshot = await getDoc(doc(db, SETTINGS_COLLECTION, UPI_SETTINGS_DOC));
  const data = snapshot.exists() ? snapshot.data() : {};
  return {
    upiId: data.upiId || DEFAULT_UPI_SETTINGS.upiId,
    payeeName: data.payeeName || DEFAULT_UPI_SETTINGS.payeeName,
  };
};

export const saveUpiSettings = async ({ upiId, payeeName }) => {
  const settings = {
    upiId: (upiId || "").trim(),
    payeeName: (payeeName || "").trim(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, SETTINGS_COLLECTION, UPI_SETTINGS_DOC), settings, {
    merge: true,
  });
  return settings;
};

// ── Products ──────────────────────────────────────────────────────────────

const sortProducts = (products) =>
  [...products].sort((a, b) => {
    const orderA = Number(a.order) || Number(a.id) || 0;
    const orderB = Number(b.order) || Number(b.id) || 0;
    return orderA - orderB;
  });

const serializeProduct = (snapshot) => {
  const data = snapshot.data();
  return { ...data, _id: snapshot.id, id: Number(data.id) };
};

export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return sortProducts(snapshot.docs.map(serializeProduct));
};

const productPayload = (product) => {
  const id = Number(product.id);
  const payload = {
    id,
    title: (product.title || "").trim(),
    img: (product.img || "").trim(),
    discount: (product.discount || "").trim(),
    original_price: product.original_price || "",
    offer_price: product.offer_price || "",
    rating: product.rating || "",
    ratings_count: Number(product.ratings_count) || 0,
    active: product.active !== false,
    order: Number(product.order) || id,
  };

  if (product.islogo) payload.islogo = true;

  return payload;
};

export const createProduct = async (product) => {
  const payload = productPayload(product);

  await setDoc(doc(db, PRODUCTS_COLLECTION, String(payload.id)), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return payload;
};

export const updateProduct = async (product) => {
  const payload = productPayload(product);

  await setDoc(
    doc(db, PRODUCTS_COLLECTION, String(payload.id)),
    { ...payload, updatedAt: serverTimestamp() },
    { merge: true }
  );

  return payload;
};

export const deleteProduct = async (productId) => {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, String(productId)));
};

// Writes the bundled catalogue into Firestore (used by "Import starter
// catalogue" in the admin panel). Existing products are overwritten.
export const importProducts = async (products) => {
  const list = sortProducts(products || []);
  if (list.length === 0) return { imported: 0 };

  const batch = writeBatch(db);

  list.forEach((product, index) => {
    const payload = productPayload({ ...product, id: Number(product.id), order: product.order ?? index + 1 });
    batch.set(
      doc(db, PRODUCTS_COLLECTION, String(payload.id)),
      { ...payload, updatedAt: serverTimestamp() },
      { merge: true }
    );
  });

  await batch.commit();
  return { imported: list.length };
};
