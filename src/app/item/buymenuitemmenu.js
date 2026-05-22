"use client";

import "./buymenuitemmenu.css";
import { useState } from "react";
import { getSession } from "../auth/authService";
import { addToCart } from "../cart/cartService";
import { showNotification } from "../notify";

function CounterBtn() {
  return (
    <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
      <path d="M8.52364 7.52087L4.51255 0.501465L0.501465 7.52087" stroke="#101010" strokeWidth="1.00277" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function BuyMenuItemMenu({ item }) {
  const sizes = item ? item.size.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const colors = item?.colors || [];

  const [sizeIndex, setSizeIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  const cycleSize = (dir) => {
    if (sizes.length === 0) return;
    setSizeIndex((prev) => (prev + dir + sizes.length) % sizes.length);
  };

  const cycleColor = (dir) => {
    if (colors.length === 0) return;
    setColorIndex((prev) => (prev + dir + colors.length) % colors.length);
  };

  function handleAdd() {
    const session = getSession();
    if (!session) { showNotification("LOGIN TO BUY"); return; }
    const selectedSize = sizes[sizeIndex] || "M";
    const selectedColor = colors[colorIndex];
    addToCart(session.telegram, {
      itemId: item?.id || "unknown",
      title: item?.title || "ITEM",
      brand: item?.brand || "BRAND",
      price: item?.price || "0",
      size: selectedSize,
      color: selectedColor ? selectedColor.name.toUpperCase() : "COLOR",
      type: (item?.type || "").toUpperCase() || "GARMENT",
      image: selectedColor?.images?.[0] || item?.colors?.[0]?.images?.[0] || item?.images?.[0] || "",
    });
    showNotification("ADDED TO CART");
  }

  const price = item ? `$${parseFloat(item.price || 0).toFixed(2)}` : "$0.00";

  return (
    <div className="slider-bottom-bar">
      <div className="ipage-price-wrap">
        <p className="ipage-price">{price}</p>
      </div>
      <div className="ipage-selectors">
        <div className="ipage-selector-group">
          <div className="ipage-selector-display">
            <span>{sizes[sizeIndex] || "-"}</span>
          </div>
          <div className="ipage-selector-arrows">
            <button className="ipage-arrow-btn" onClick={() => cycleSize(1)}><CounterBtn /></button>
            <button className="ipage-arrow-btn ipage-arrow-down" onClick={() => cycleSize(-1)}><CounterBtn /></button>
          </div>
        </div>
        <div className="ipage-selector-group">
          <div className="ipage-selector-display">
            {colors[colorIndex] && (
              <div className="ipage-color-block" style={{ backgroundColor: colors[colorIndex].hex }} />
            )}
            <span>{colors[colorIndex]?.name || "-"}</span>
          </div>
          <div className="ipage-selector-arrows">
            <button className="ipage-arrow-btn" onClick={() => cycleColor(1)}><CounterBtn /></button>
            <button className="ipage-arrow-btn ipage-arrow-down" onClick={() => cycleColor(-1)}><CounterBtn /></button>
          </div>
        </div>
      </div>
      <div className="ipage-buy-wrap">
        <button className="ipage-buy-btn" onClick={handleAdd}>ADD TO CART</button>
      </div>
    </div>
  );
}
