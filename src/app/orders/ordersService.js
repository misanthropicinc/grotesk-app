const ORDERS_KEY = "grotesk_orders";

function getOrders() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function placeOrder(telegram, items, shipping, total) {
  const orders = getOrders();
  const order = {
    id: "ORD-" + Date.now().toString(36).toUpperCase(),
    telegram,
    items,
    shipping,
    total,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function getUserOrders(telegram) {
  return getOrders().filter((o) => o.telegram === telegram);
}

export function getOrderById(orderId) {
  return getOrders().find((o) => o.id === orderId) || null;
}

export function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    saveOrders(orders);
  }
}
