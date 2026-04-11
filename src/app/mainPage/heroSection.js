"use client";

import { useEffect, useRef, useReducer } from "react";
import Image from "next/image";
import "./heroSection.css";
import "../header.css";
import logoImg from "../../imgs/grotesk-header-logo.png";

function shuffleImages(images) {
  return [...images].sort(() => Math.random() - 0.5);
}

const initialState = { images: [], currentIndex: 0, isSticky: false };

function reducer(state, action) {
  switch (action.type) {
    case "init":
      return { ...state, images: shuffleImages(action.payload) };
    case "next":
      return { ...state, currentIndex: (state.currentIndex + 1) % state.images.length };
    case "sticky":
      return { ...state, isSticky: action.payload };
    default:
      return state;
  }
}

export default function HeroSection({ heroImages = [] }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    images: heroImages,
  });
  const headerRef = useRef(null);
  const isFirstRender = useRef(true);
  const isSticky = useRef(false);

  // Shuffle images only on first render to avoid hydration mismatch
  useEffect(() => {
    if (heroImages.length > 0 && isFirstRender.current) {
      isFirstRender.current = false;
      dispatch({ type: "init", payload: heroImages });
    }
  }, [heroImages]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "next" });
    }, 3000);

    return () => clearInterval(interval);
  }, [state.images]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleScroll = () => {
      const headerRect = header.getBoundingClientRect();

      if (headerRect.top <= 0 && !isSticky.current) {
        isSticky.current = true;
        dispatch({ type: "sticky", payload: true });
      } else if (headerRect.top >= 0 && isSticky.current) {
        isSticky.current = false;
        dispatch({ type: "sticky", payload: false });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, []);

  return (
    <section className="hero">
      <div className="imageContainer">
        {state.images.length > 0 ? state.images.map((src, index) => (
          <div
            key={src}
            className={`slide ${index === state.currentIndex ? "active" : ""}`}
          >
            <Image
              src={src}
              alt={`Hero slide ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="image"
              unoptimized
              suppressHydrationWarning
            />
          </div>
        )) : heroImages.map((src, index) => (
          <div
            key={src}
            className={`slide ${index === state.currentIndex ? "active" : ""}`}
          >
            <Image
              src={src}
              alt={`Hero slide ${index + 1}`}
              fill
              priority={index === 0}
              sizes="100vw"
              className="image"
              unoptimized
              suppressHydrationWarning
            />
          </div>
        ))}
      </div>
      <header
        ref={headerRef}
        className={`heroHeader ${state.isSticky ? "sticky" : "visible"}`}
      >
        <nav>
          <a className="grotesk-header-logo">
              <Image
                src={logoImg}
                width={71}
                height={19}
                alt="logo"
              />
            </a>
          <div className="header-left">
            <a>MENSWEAR</a>
            <a>WOMENSWEAR</a>
            <a>SNEAKERS</a>
            <a>DESIGNERS</a>
            <a>ABOUT</a>
            <a>GITHUB</a>
          </div>
        </nav>
      </header>
    </section>
  );
}
