"use client";

import "./designerSection.css";
import DesignerCard from "./designerCard";
import SliderBtn from "../sliderBtn";
import { useState, useEffect } from "react";

const CARD_COLORS = [
  "red",
  "green",
  "blue",
  "orange",
  "purple",
  "cyan",
  "yellow",
  "magenta",
  "lime",
];

const CARDS_BASE = [
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
  "/imgs/designerGifs/maison-martin-margiela-matthias-brown-gif-by-traceloops-find.mp4",
];

const LOOPED_CARDS = [...CARDS_BASE, ...CARDS_BASE, ...CARDS_BASE];

export default function DesignerSection() {
  const [hoveredId, setHoveredId] = useState(null);
  const [index, setIndex] = useState(CARDS_BASE.length);

  const cardWidth = 100 / 3;

  useEffect(() => {
    if (index >= CARDS_BASE.length * 2) {
      setTimeout(() => {
        setIndex(CARDS_BASE.length);
      }, 400);
    }
    if (index <= 0) {
      setTimeout(() => {
        setIndex(CARDS_BASE.length);
      }, 400);
    }
  }, [index]);

  const nextSlide = () => setIndex((prev) => prev + 1);
  const prevSlide = () => setIndex((prev) => prev - 1);

  return (
    <section className="designerSection">
      <button className="sliderBtn sliderBtnLeft" onClick={prevSlide}>
        <SliderBtn />
      </button>
      
      <div className="sliderContainer">
        <div 
          className="sliderTrack"
          style={{
            transform: `translateX(-${index * cardWidth}%)`,
            transition: "transform 0.4s ease"
          }}
        >
          {LOOPED_CARDS.map((img, i) => (
            <DesignerCard 
              key={i}
              id={`designerCard${i}`} 
              imgSrc={img}
              isHovered={hoveredId === `designerCard${i}`}
              isAnyHovered={hoveredId !== null}
              onHover={() => setHoveredId(`designerCard${i}`)}
              onLeave={() => setHoveredId(null)}
              borderColor={CARD_COLORS[i % CARD_COLORS.length]}
            />
          ))}
        </div>
      </div>
      
      <button className="sliderBtn sliderBtnRight" onClick={nextSlide}>
        <SliderBtn />
      </button>
    </section>
  );
}