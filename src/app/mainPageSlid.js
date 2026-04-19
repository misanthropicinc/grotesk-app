"use client";

import "./mainPageSlid.css";
import SliderBtn from "./sliderBtn";
import MainPageSlidBtn from "./mainPageSlidBtn";
import { useState, useEffect } from "react";

const CARDS = [
  {
    id: 1,
    image: "/imgs/mainPageSlidImgs/RS.png",
    title: "RAF SIMONS",
    subtitle: "MORE FROM THE LEGENDARY BRAND",
  },
  {
    id: 2,
    image: "/imgs/mainPageSlidImgs/RO.png",
    title: "RICK OWENS",
    subtitle: "BECOME THE ANTAGONIST OF FASHION",
  },
];

export default function MainPageSlider({ cards = CARDS }) {
  const [currentIndex, setCurrentIndex] = useState(cards.length);
  const [isAnimating, setIsAnimating] = useState(false);

  const loopedCards = [...cards, ...cards, ...cards];
  const slideCount = loopedCards.length;
  const translateStep = 100 / slideCount;

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
  };

  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  useEffect(() => {
    if (currentIndex >= cards.length * 2) {
      const timer = setTimeout(() => {
        setCurrentIndex(cards.length);
      }, 400);
      return () => clearTimeout(timer);
    }

    if (currentIndex <= 0) {
      const timer = setTimeout(() => {
        setCurrentIndex(cards.length);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, cards.length]);

  const subtitleLines = (subtitle) =>
    subtitle.split(" ").reduce((acc, word, idx) => {
      if (idx % 3 === 0) acc.push(word);
      else acc[acc.length - 1] += ` ${word}`;
      return acc;
    }, []);

  return (
    <div className="mainPageSliderContainer">
      <button className="sliderBtn sliderBtnLeft" onClick={prevSlide}>
        <SliderBtn />
      </button>

      <div className="mainPageSliderViewport">
        <div
          className="mainPageSliderTrack"
          style={{
            width: `${slideCount * 100}%`,
            transform: `translateX(-${currentIndex * translateStep}%)`,
            transition: isAnimating ? "transform 0.4s ease" : "none",
          }}
        >
          {loopedCards.map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              className="card"
              style={{ width: `${100 / slideCount}%` }}
            >
              <img src={card.image} alt={card.title} className="cardImage" />
              <div className="cardInfo">
                <div className="cardText">
                  <p className="cardTitle">{card.title}</p>
                  <p className="cardSubtitle">
                    {subtitleLines(card.subtitle).map((line, idx, arr) => (
                      <span key={idx}>
                        {line}
                        {idx < arr.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </p>
                </div>
                <MainPageSlidBtn />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="sliderBtn sliderBtnRight" onClick={nextSlide}>
        <SliderBtn />
      </button>
    </div>
  );
}
