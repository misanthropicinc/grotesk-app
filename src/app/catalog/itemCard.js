"use client";

import "./ItemCard.css";
import ItemCardMenu from "./itemCardMenu";
import { useState } from "react";
import Link from "next/link";
import { getSession } from "../auth/authService";
import { addToCart } from "../cart/cartService";
import { showNotification } from "../notify";

export default function ItemCard({ title, brand, price, image }) {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmClick, setConfirmClick] = useState(false);

  const handleClick = () => {
    if (confirmClick) return true;
    setConfirmClick(true);
    setTimeout(() => setConfirmClick(false), 2000);
  };

  const hasData = !!title;

  function handleAddToCart(e) {
    e.stopPropagation();
    const session = getSession();
    if (!session) { showNotification("LOGIN TO BUY"); return; }
    addToCart(session.telegram, {
      itemId: title || "unknown",
      title: title || "ITEM",
      brand: brand || "BRAND",
      price: price || "0",
      size: "M",
      color: "BLACK",
      type: "GARMENT",
      image: image || "",
    });
    showNotification("ADDED TO CART");
  }

  return (
    <div className="item-card-main">
      <div className="item-card-img" style={image ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
        <div className={`item-card-menu-wrapper ${showMenu ? "open" : ""}`}>
          <ItemCardMenu />
        </div>
      </div>
      <div className="item-card-info">
        <div className="item-card-content-top">
          <Link href={confirmClick || !hasData ? "/item" : "#"} onClick={(e) => { if (!confirmClick && !hasData) { e.preventDefault(); handleClick(); } }} className="item-card-link-area">
            <div className="item-card-brand-text">
              <p className="item-card-item-title">{hasData ? title : (confirmClick ? "CLICK AGAIN" : "ITEM TITLE")}</p>
              <p className="item-card-brand-title">{hasData ? brand : "BRAND TITLE"}</p>
            </div>
            <p className="item-card-item-price">{hasData ? `$${parseFloat(price).toLocaleString()}` : "$69420.00"}</p>
          </Link>
        </div>
        <div className="item-card-content-bottom">
          <button onClick={handleAddToCart}>
            <span>+</span> ADD TO CART
          </button>
          <button onClick={() => setShowMenu(!showMenu)}>
            QUICK BUY <span>{showMenu ? "−" : "+"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
