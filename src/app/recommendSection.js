"use client";

import "./recommendSection.css";
import MainPageSlider from "./mainPageSlid";
import RecommendCategory from "./recommendCategory";

export default function MoneyOnTopOfMe() {
  return (
    <section className="recommendSection">
      <MainPageSlider />
      <div className="featuredRecom">
        <p>FEATURED CATEGORIES</p>
      </div>
      <div className="featuredCats">
        <RecommendCategory />
        <RecommendCategory />
        <RecommendCategory />
        <RecommendCategory />
      </div>
    </section>
  );
}
