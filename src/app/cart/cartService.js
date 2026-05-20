const CART_PREFIX = "grotesk_cart_";

function getCart(telegram) {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CART_PREFIX + telegram);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(telegram, cart) {
  localStorage.setItem(CART_PREFIX + telegram, JSON.stringify(cart));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-update"));
  }
}

export function addToCart(telegram, item) {
  const cart = getCart(telegram);
  const existing = cart.find((c) => c.itemId === item.itemId && c.size === item.size);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      itemId: item.itemId,
      title: item.title,
      brand: item.brand,
      price: item.price,
      size: item.size || "",
      color: item.color || "",
      type: item.type || "",
      image: item.image || "",
      quantity: item.quantity || 1,
      addedAt: new Date().toISOString(),
    });
  }
  saveCart(telegram, cart);
  return cart;
}

export function removeFromCart(telegram, cartItemId) {
  const cart = getCart(telegram).filter((c) => c.id !== cartItemId);
  saveCart(telegram, cart);
  return cart;
}

export function updateCartQuantity(telegram, cartItemId, qty) {
  const cart = getCart(telegram);
  const item = cart.find((c) => c.id === cartItemId);
  if (item) {
    item.quantity = Math.max(1, qty);
    saveCart(telegram, cart);
  }
  return cart;
}

export function getCartItems(telegram) {
  return getCart(telegram);
}

export function clearCart(telegram) {
  localStorage.removeItem(CART_PREFIX + telegram);
}

export function getCartTotal(telegram) {
  const cart = getCart(telegram);
  return cart.reduce((sum, c) => sum + parseFloat(c.price) * c.quantity, 0);
}

export function getCartCount(telegram) {
  return getCart(telegram).reduce((sum, c) => sum + c.quantity, 0);
}
