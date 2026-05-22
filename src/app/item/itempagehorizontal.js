"use client";

import { useRef, useEffect, useState } from "react";
import "./itempagehorizontal.css";
import HorizontalScrollBar from "./HorizontalScrollBar";
import ItemMenu from "./ItemMenu";
import BuyMenuItemMenu from "./buymenuitemmenu";
import { getItemById, seedDefaultItem } from "../profile/profileService";

export default function ItemPageHorizontal({ id }) {
  const scrollRef = useRef(null);
  const [item, setItem] = useState(null);
  const [displayImages, setDisplayImages] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [zoomStyle, setZoomStyle] = useState({});
  const slideRefs = useRef([]);
  const zoomRef = useRef(null);
  const zoomTextRef = useRef(null);

  useEffect(() => {
    if (id) {
      seedDefaultItem();
      const found = getItemById(id);
      if (found) {
        setItem(found);
        const all = (found.colors || []).flatMap((c) => c.images || []);
        setDisplayImages(all.length > 0 ? all : found.images || []);
      }
    }
  }, [id]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onWheel = (e) => {
      const canScroll = container.scrollWidth > container.clientWidth;
      if (!canScroll) return;

      e.preventDefault();
      e.stopPropagation();
      container.scrollLeft += e.deltaY * 1.3;
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  const handleMouseMove = (e, index) => {
    const nextPos = { x: e.clientX, y: e.clientY };
    setCursorPos(nextPos);

    if (zoomTextRef.current && hoveredIndex === index) {
      zoomTextRef.current.style.left = `${nextPos.x + 10}px`;
      zoomTextRef.current.style.top = `${nextPos.y + 10}px`;
    }

    if (zoomedIndex !== null && slideRefs.current[index]) {
      const rect = slideRefs.current[index].getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width;
      const yPct = (e.clientY - rect.top) / rect.height;
      const zoomFactor = 2;
      const bgWidth = rect.width * zoomFactor;
      const bgHeight = rect.height * zoomFactor;

      if (zoomRef.current) {
        zoomRef.current.style.left = `${nextPos.x + 15}px`;
        zoomRef.current.style.top = `${nextPos.y + 15}px`;
      }

      setZoomStyle({
        backgroundImage: `url(${displayImages[index]})`,
        backgroundSize: `${bgWidth}px ${bgHeight}px`,
        backgroundPosition: `${xPct * 100}% ${yPct * 100}%`,
        backgroundRepeat: "no-repeat",
      });
    }
  };

  const handleClick = (index) => {
    if (zoomedIndex === index) {
      setZoomedIndex(null);
    } else {
      setZoomedIndex(index);
    }
  };

  return (
    <div 
      className="horizontal-slider-wrapper"
    >
      <ItemMenu item={item} />
      <HorizontalScrollBar scrollRef={scrollRef} />
      <BuyMenuItemMenu item={item} />
      <div className="horizontal-slider" ref={scrollRef}
        onMouseLeave={() => {
          setZoomedIndex(null);
          setHoveredIndex(null);
        }}
      >
        {displayImages.length > 0 ? displayImages.slice(0, 5).map((src, index) => (
          <div
            key={index}
            className="horizontal-slide"
            ref={(el) => (slideRefs.current[index] = el)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={() => handleClick(index)}
          >
            <img
              src={src}
              alt={`item-${index}`}
              className="horizontal-slide-image"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )) : (
          <div style={{ width: 640, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#999" }}>
            {id ? "ITEM NOT FOUND" : "NO ITEM SELECTED"}
          </div>
        )}
      </div>
      {hoveredIndex !== null && (
        <div
          ref={zoomTextRef}
          style={{
            position: "fixed",
            left: `${cursorPos.x + 10}px`,
            top: `${cursorPos.y + 10}px`,
            pointerEvents: "none",
            zIndex: 10000,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "2px 6px",
            fontSize: "12px",
          }}
        >
          ZOOM
        </div>
      )}
      {zoomedIndex !== null && (
        <div
          ref={zoomRef}
          className="slider-zoom"
          style={{
            left: `${cursorPos.x + 15}px`,
            top: `${cursorPos.y + 15}px`,
            ...zoomStyle,
          }}
        />
      )}
    </div>
  );
}
