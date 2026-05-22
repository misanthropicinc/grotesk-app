import "./designerCard.css";
import { useRef, useEffect, useState } from "react";

export default function DesignerCard({ id, isHovered, isAnyHovered, onHover, onLeave, imgSrc }) {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const shouldPlay = isVisible && (isHovered || !isAnyHovered);
    
    if (shouldPlay && video.paused) {
      video.play().catch(() => {});
    } else if (!shouldPlay && !video.paused) {
      video.pause();
    }
  }, [isAnyHovered, isHovered, isVisible]);

  const posterSrc = imgSrc.replace('.webm', '-poster.webp');

  return (
    <a
      ref={cardRef}
      id={id}
      href="/catalog"
      className={`designerCard ${isHovered ? "hovered" : ""}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <video 
        ref={videoRef} 
        src={imgSrc} 
        poster={posterSrc}
        muted 
        loop 
        playsInline 
        preload="none"
      />
      <div className="overlay" />
      <p>DESIGNER</p>
    </a>
  );
}
