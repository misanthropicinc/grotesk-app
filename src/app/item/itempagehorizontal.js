"use client";

import { useRef, useEffect } from "react";
import "./itempagehorizontal.css";

export default function ItemPageHorizontal() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onWheel = (e) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY * 1.3;
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  const images = [
    "/imgs/hero/heroRick.png",
    "/imgs/hero/heroRick2.png",
    "/imgs/hero/heroRS.png",
    "/imgs/hero/heroGivenchy.png",
    "/imgs/hero/heroERD.png",
    "/imgs/hero/heroCDG1.png",
    "/imgs/hero/heroCDG2.png",
  ];

  return (
    <div className="horizontal-slider" ref={scrollRef}>
      {images.map((src, index) => (
        <div key={index} className="horizontal-slide">
          <img src={src} alt={`item-${index}`} />
        </div>
      ))}
    </div>
  );
}
