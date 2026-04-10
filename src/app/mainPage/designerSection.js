"use client";

import "./designerSection.css";
import DesignerCard from "./designerCard";
import { useState } from "react";

const IMAGES = [
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
];

export default function DesignerSection() {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section className="designerSection">
      {IMAGES.map((img, i) => (
        <DesignerCard 
          key={i}
          id={`designerCard${i}`} 
          imgSrc={img}
          isHovered={hoveredId === `designerCard${i}`}
          isAnyHovered={hoveredId !== null}
          onHover={() => setHoveredId(`designerCard${i}`)}
          onLeave={() => setHoveredId(null)}
        />
      ))}
    </section>
  );
}
