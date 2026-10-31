const CART_KEY = "basket_cart";

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
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
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
};

export const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item.id !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
};

export const updateCartQty = (productId, qty) => {
  if (qty <= 0) return removeFromCart(productId);
  const cart = getCart().map((item) =>
    item.id === productId ? { ...item, qty } : item
  );
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
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

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  return [];
};
