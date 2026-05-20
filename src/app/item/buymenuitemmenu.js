"use client";

import { getSession } from "../auth/authService";
import { addToCart } from "../cart/cartService";
import { showNotification } from "../notify";

export default function BuyMenuItemMenu() {
  function handleAdd() {
    const session = getSession();
    if (!session) { showNotification("LOGIN TO BUY"); return; }
    addToCart(session.telegram, {
      itemId: "hoodie-ss26-temple",
      title: "OVERSIZED HOODIE",
      brand: "DRKSHDW",
      price: "600",
      size: "M",
      color: "BLACK/MILK",
      type: "HOODIE",
      image: "/imgs/presetitemimg1.webp",
    });
    showNotification("ADDED TO CART");
  }

  return (
    <>
      <div className="slider-bottom-bar">
        <div className="buy-btn-div-ipage">
          <button className="buy-btn-item-page" onClick={handleAdd}>ADD TO CART</button>
        </div>
        <div className="price-div-ipage">
          <p className="price-ipage">$600.00</p>
        </div>
        <div className="size-div-ipage">
          <p className="size-title-ipage">SIZE</p>
        </div>
        <div className=""></div>
      </div>
    </>
  );
}
