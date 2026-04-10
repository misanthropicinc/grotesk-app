import "./designerCard.css";
import { useRef, useEffect } from "react";

export default function DesignerCard({ id, isHovered, isAnyHovered, onHover, onLeave, imgSrc }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    if (isHovered) {
      if (video.paused) {
        video.play().catch(() => {});
      }
    } else if (isAnyHovered && !isHovered) {
      video.pause();
    } else if (!isAnyHovered) {
      if (video.paused) {
        video.play().catch(() => {});
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
