"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";
import { getSession } from "../auth/authService";
import { getCartItems, removeFromCart, updateCartQuantity, clearCart, getCartTotal } from "./cartService";
import "./cart.css";

export default function CartPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push("/auth");
      return;
    }
    setSession(s);
    const items = getCartItems(s.telegram);
    setCart(items);
    setTotal(getCartTotal(s.telegram));
  }, []);

  function refresh() {
    if (!session) return;
    setCart(getCartItems(session.telegram));
    setTotal(getCartTotal(session.telegram));
  }

  function handleRemove(id) {
    if (!session) return;
    removeFromCart(session.telegram, id);
    refresh();
  }

  function handleQty(id, delta) {
    if (!session) return;
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    const qty = item.quantity + delta;
    if (qty < 1) return;
    updateCartQuantity(session.telegram, id, qty);
    refresh();
  }

  function handleCheckout() {
    if (!session) return;
    router.push("/checkout");
  }

  const subtotal = total;
  const shipping = 0;
  const grandTotal = subtotal + shipping;

  return (
    <>
      <PageHeader />
      <Breadcrumbs />
      <div className="cart-page">
        <h1>Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="cart-empty">Your cart is empty</div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-left">
                    {item.image ? (
                      <img src={item.image} alt="" className="cart-item-img" />
                    ) : (
                      <div className="cart-item-img" style={{ background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#999" }}>
                        NO IMAGE
                      </div>
                    )}
                    <div className="cart-item-info">
                      <div className="cart-item-brand">{item.brand}</div>
                      <div className="cart-item-title">{item.title}</div>
                      <div className="cart-item-meta">SIZE: {item.size}</div>
                      <div className="cart-item-meta">COLOR: {item.color}</div>
                      <div className="cart-item-info-price">${parseFloat(item.price).toLocaleString()}</div>
                      <div className="cart-item-qty">
                        <button onClick={() => handleQty(item.id, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQty(item.id, 1)}>+</button>
                      </div>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-item-right-price">${parseFloat(item.price).toLocaleString()}</div>
                    <button className="cart-item-remove" onClick={() => handleRemove(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-title">Order Summary</div>

              {cart.map((item) => (
                <div key={item.id} className="cart-summary-row">
                  <span>{item.title} × {item.quantity}</span>
                  <span>${(parseFloat(item.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <hr className="cart-summary-divider" />
              <div className="cart-summary-total">
                <span>Total</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
              <div className="cart-summary-delivery">Delivery estimate: 7–14 business days</div>
              <button className="cart-checkout-btn" onClick={handleCheckout}>Checkout</button>
              <div className="cart-payment-icons">
                <span>VISA</span>
                <span>MC</span>
                <span>AMEX</span>
                <span>PP</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
