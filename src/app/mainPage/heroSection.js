"use client";

import { useState, useEffect, useRef } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleScroll = () => {
      const headerRect = header.getBoundingClientRect();
      
      if (headerRect.top <= 0 && !isSticky) {
        setIsSticky(true);
      } else if (headerRect.top >= 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isSticky]);

  return (
    <section className="hero">
      <div className="imageContainer">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`slide ${index === currentIndex ? "active" : ""}`}
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
      <header
        ref={headerRef}
        className={`heroHeader ${isSticky ? "sticky" : ""}`}
      >
        <div className="header-left">MENSWEAR</div>
        <div className="header-center">GROTESK</div>
        <div className="header-right">SEARCH</div>
      </header>
    </section>
  );
}
