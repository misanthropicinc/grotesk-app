"use client";

import "./recommendSection.css";
import MainPageSlider from "./mainPageSlid";
import RecommendCategory from "./recommendCategory";
import { useState, useEffect } from "react";
import { seedDefaultItem } from "../profile/profileService";

const FALLBACKS = [
  { label: "BOMBERS", type: "Bomber Jacket", gender: "Male" },
  { label: "HOODIES", type: "Hoodie", gender: "Male" },
  { label: "LONGSLEEVES", type: "Longsleeve", gender: "Male" },
  { label: "SNEAKERS", type: "Sneakers", gender: "Male" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getItems() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("grotesk_items") || "[]");
  } catch {
    return [];
  }
}

export default function MoneyOnTopOfMe() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    seedDefaultItem();
    const all = getItems();
    const picked = shuffle(all).slice(0, 4);
    const result = [];
    for (let i = 0; i < 4; i++) {
      if (i < picked.length) {
        result.push({ source: "item", data: picked[i] });
      } else {
        const fb = FALLBACKS[i % FALLBACKS.length];
        result.push({ source: "fallback", data: fb });
      }
    }
    setCards(result);
  }, []);

  return (
    <section className="recommendSection">
      <MainPageSlider />
      <div className="featuredRecom">
        <p>FEATURED CATEGORIES</p>
      </div>
      <div className="featuredCats">
        {cards.map((card, i) => (
          <RecommendCategory key={i} card={card} />
        ))}
      </div>
    </section>
  );
}
