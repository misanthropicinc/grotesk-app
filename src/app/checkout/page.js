"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";
import { getSession } from "../auth/authService";
import { getCartItems, clearCart, getCartTotal } from "../cart/cartService";
import { placeOrder } from "../orders/ordersService";
import "./checkout.css";

const AUTOFILL_DATA = {
  name: "John Doe",
  email: "john@example.com",
  address: "123 Grotesk Ave",
  city: "New York",
  zip: "10001",
  country: "United States",
  cardNumber: "4242 4242 4242 4242",
  expiry: "12/28",
  cvv: "123",
};

export default function CheckoutPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const shipping = 0;

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push("/auth"); return; }
    setSession(s);
    const items = getCartItems(s.telegram);
    if (items.length === 0) { router.push("/cart"); return; }
    setCart(items);
    setTotal(getCartTotal(s.telegram));
  }, []);

  useEffect(() => {
    function handleAutofill() {
      if (!session) return;
      const shipping = 0;
      const gt = total + shipping;
      setName(AUTOFILL_DATA.name);
      setEmail(AUTOFILL_DATA.email);
      setAddress(AUTOFILL_DATA.address);
      setCity(AUTOFILL_DATA.city);
      setZip(AUTOFILL_DATA.zip);
      setCountry(AUTOFILL_DATA.country);
      setCardNumber(AUTOFILL_DATA.cardNumber);
      setExpiry(AUTOFILL_DATA.expiry);
      setCvv(AUTOFILL_DATA.cvv);
      setErrors({});
      setSubmitting(true);
      const order = placeOrder(session.telegram, cart, {
        name: AUTOFILL_DATA.name,
        email: AUTOFILL_DATA.email,
        address: AUTOFILL_DATA.address,
        city: AUTOFILL_DATA.city,
        zip: AUTOFILL_DATA.zip,
        country: AUTOFILL_DATA.country,
      }, gt);
      clearCart(session.telegram);
      router.push(`/order?id=${order.id}`);
    }
    window.addEventListener("checkout-autofill", handleAutofill);
    return () => window.removeEventListener("checkout-autofill", handleAutofill);
  }, [session, cart, total]);

  const grandTotal = total + shipping;

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email format";
    if (!address.trim()) errs.address = "Address is required";
    if (!city.trim()) errs.city = "City is required";
    if (!zip.trim()) errs.zip = "ZIP / Postal code is required";
    if (!country.trim()) errs.country = "Country is required";
    if (!cardNumber.trim()) errs.cardNumber = "Card number is required";
    else if (!/^[\d\s]{13,19}$/.test(cardNumber.trim())) errs.cardNumber = "Invalid card number";
    if (!expiry.trim()) errs.expiry = "Expiry is required";
    else if (!/^\d{2}\/\d{2}$/.test(expiry.trim())) errs.expiry = "Use MM/YY format";
    if (!cvv.trim()) errs.cvv = "CVV is required";
    else if (!/^\d{3,4}$/.test(cvv.trim())) errs.cvv = "Invalid CVV";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const doPlaceOrder = useCallback(() => {
    if (!session) return;
    if (!validate()) return;
    setSubmitting(true);
    const order = placeOrder(session.telegram, cart, {
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      zip: zip.trim(),
      country: country.trim(),
    }, grandTotal);
    clearCart(session.telegram);
    router.push(`/order?id=${order.id}`);
  }, [session, cart, name, email, address, city, zip, country, grandTotal]);

  function handlePlaceOrder(e) {
    e.preventDefault();
    doPlaceOrder();
  }

  return (
    <>
      <PageHeader />
      <Breadcrumbs />
      <div className="checkout-page">
        <h1>CHECKOUT</h1>
        {Object.keys(errors).length > 0 && (
          <div className="checkout-errors">
            {Object.values(errors).map((msg, i) => (
              <p key={i} className="checkout-error-msg">{msg}</p>
            ))}
          </div>
        )}
        <form className="checkout-grid" onSubmit={handlePlaceOrder} noValidate>
          <div className="checkout-form">
            <div className="checkout-section">
              <h2>SHIPPING</h2>
              <div className="checkout-field">
                <label>Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={errors.name ? "input-error" : ""} />
                {errors.name && <span className="checkout-field-error">{errors.name}</span>}
              </div>
              <div className="checkout-field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? "input-error" : ""} />
                {errors.email && <span className="checkout-field-error">{errors.email}</span>}
              </div>
              <div className="checkout-field">
                <label>Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={errors.address ? "input-error" : ""} />
                {errors.address && <span className="checkout-field-error">{errors.address}</span>}
              </div>
              <div className="checkout-row">
                <div className="checkout-field">
                  <label>City</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} className={errors.city ? "input-error" : ""} />
                  {errors.city && <span className="checkout-field-error">{errors.city}</span>}
                </div>
                <div className="checkout-field">
                  <label>ZIP / Postal</label>
                  <input value={zip} onChange={(e) => setZip(e.target.value)} className={errors.zip ? "input-error" : ""} />
                  {errors.zip && <span className="checkout-field-error">{errors.zip}</span>}
                </div>
              </div>
              <div className="checkout-field">
                <label>Country</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className={errors.country ? "input-error" : ""} />
                {errors.country && <span className="checkout-field-error">{errors.country}</span>}
              </div>
            </div>
            <div className="checkout-section">
              <h2>PAYMENT</h2>
              <div className="checkout-field">
                <label>Card Number</label>
                <input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className={errors.cardNumber ? "input-error" : ""} />
                {errors.cardNumber && <span className="checkout-field-error">{errors.cardNumber}</span>}
              </div>
              <div className="checkout-row">
                <div className="checkout-field">
                  <label>Expiry</label>
                  <input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={errors.expiry ? "input-error" : ""} />
                  {errors.expiry && <span className="checkout-field-error">{errors.expiry}</span>}
                </div>
                <div className="checkout-field">
                  <label>CVV</label>
                  <input placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} className={errors.cvv ? "input-error" : ""} />
                  {errors.cvv && <span className="checkout-field-error">{errors.cvv}</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="checkout-summary">
            <h2>ORDER SUMMARY</h2>
            {cart.map((item) => (
              <div key={item.id} className="checkout-summary-row">
                <div className="checkout-summary-item">
                  {item.image && <img src={item.image} alt="" className="checkout-summary-img" />}
                  <div>
                    <p className="checkout-summary-title">{item.title}</p>
                    <p className="checkout-summary-meta">{item.size} / {item.color}</p>
                    <p className="checkout-summary-meta">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="checkout-summary-price">${(parseFloat(item.price) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <hr className="checkout-divider" />
            <div className="checkout-summary-total">
              <span>Total</span>
              <span>${grandTotal.toLocaleString()}</span>
            </div>
            <button type="submit" className="checkout-place-btn" disabled={submitting}>{submitting ? "PLACING..." : "PLACE ORDER"}</button>
          </div>
        </form>
      </div>
    </>
  );
}
