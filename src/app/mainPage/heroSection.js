"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "./heroSection.css";

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const heroImages = [
  "/imgs/hero/heroERD.png",
  "/imgs/hero/heroGivenchy.png",
  "/imgs/hero/heroCDG1.png",
  "/imgs/hero/heroCDG2.png",
  "/imgs/hero/heroRick.png",
  "/imgs/hero/heroRick2.png",
  "/imgs/hero/heroRS.png",
];

export default function HeroSection() {
  const [state, setState] = useState({
    images: heroImages,
    currentIndex: 0,
  });

  useEffect(() => {
    setState({
      images: shuffleArray(heroImages),
      currentIndex: Math.floor(Math.random() * heroImages.length),
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        currentIndex: (prev.currentIndex + 1) % prev.images.length,
      }));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="imageContainer">
        {state.images.map((src, index) => (
          <div
            key={src}
            className={`slide ${
              index === state.currentIndex ? "active" : ""
            }`}
          >
            <Image
              src={src}
              alt={`Hero slide ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="image"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
