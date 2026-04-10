import "./designerCard.css";
import { useRef, useEffect } from "react";

export default function DesignerCard({ id, isHovered, isAnyHovered, onHover, onLeave, imgSrc }) {
  const videoRef = useRef(null);
  const wasHovered = useRef(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isAnyHovered && !isHovered) {
        videoRef.current.pause();
        wasHovered.current = false;
      } else if (!isAnyHovered && !wasHovered.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        wasHovered.current = false;
      } else if (isHovered && !wasHovered.current) {
        wasHovered.current = true;
      }
    }
  }, [isAnyHovered, isHovered]);

  return (
    <div 
      id={id} 
      className={`designerCard ${isHovered ? "hovered" : ""}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <video ref={videoRef} src={imgSrc} autoPlay muted loop playsInline />
      <div className="overlay" />
      <p>DESIGNER</p>
    </div>
  );
}
