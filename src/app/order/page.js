"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";
import { getOrderById } from "../orders/ordersService";
import "./order.css";

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);

  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      const found = getOrderById(id);
      setOrder(found);
    }
  }, [id]);

  if (!order) {
    return (
      <>
        <PageHeader />
        <Breadcrumbs />
        <div className="order-page">
          <div className="order-empty">{id ? "ORDER NOT FOUND" : "NO ORDER SELECTED"}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader />
      <Breadcrumbs />
      <div className="order-page">
        <div className="order-header">
          <h1>ORDER {order.id}</h1>
          <span className={`order-status order-status--${order.status}`}>{order.status.toUpperCase()}</span>
        </div>
        <p className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="order-grid">
          <div className="order-section">
            <h2>ITEMS</h2>
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                {item.image && <img src={item.image} alt="" className="order-item-img" />}
                <div className="order-item-info">
                  <p className="order-item-title">{item.title}</p>
                  <p className="order-item-brand">{item.brand}</p>
                  <p className="order-item-meta">{item.size} / {item.color}</p>
                  <p className="order-item-meta">Qty: {item.quantity}</p>
                  <p className="order-item-price">${(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-section">
            <h2>SHIPPING</h2>
            <div className="order-shipping">
              <p>{order.shipping?.name}</p>
              <p>{order.shipping?.address}</p>
              <p>{order.shipping?.city}, {order.shipping?.zip}</p>
              <p>{order.shipping?.country}</p>
            </div>
          </div>
        </div>

        <div className="order-total-row">
          <span>TOTAL</span>
          <span>${(order.total || 0).toLocaleString()}</span>
        </div>

        <button className="order-back-btn" onClick={() => router.push("/profile")}>BACK TO PROFILE</button>
      </div>
    </>
  );
}
