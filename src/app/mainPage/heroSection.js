"use client";

import { useEffect, useRef, useReducer, useState } from "react";
import Image from "next/image";
import "./heroSection.css";
import "../header.css";
import HeaderMenu from "../headerMenu";
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
      return {
        ...state,
        currentIndex: (state.currentIndex + 1) % state.images.length,
      };
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeBtn, setActiveBtn] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const sentinelRef = useRef(null);
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
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !isSticky.current) {
          isSticky.current = true;
          dispatch({ type: "sticky", payload: true });
        } else if (entry.isIntersecting && isSticky.current) {
          isSticky.current = false;
          dispatch({ type: "sticky", payload: false });
        }
      },
      {
        root: null,
        rootMargin: "-35px 0px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="hero">
      <div className="imageContainer">
        {state.images.length > 0
          ? state.images.map((src, index) => (
              <div
                key={`${src}-${index}`}
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
            ))
          : heroImages.map((src, index) => (
              <div
                key={`hero-${index}`}
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
      <div ref={sentinelRef} className="heroHeaderSentinel" />
      <div className="header-container">
        <header
          className={`heroHeader ${state.isSticky ? "sticky" : "visible"}`}
        >
          <nav>
            <a className="grotesk-header-logo">
              <Image src={logoImg} width={71} height={19} alt="logo" />
            </a>
            <div className="header-left">
              <div className="nav1left">
                <div className="nav-btns">
                  <div
                    className="header-btn"
                    onClick={() => {
                      setActiveBtn(
                        activeBtn === "menswear" ? null : "menswear",
                      );
                      setMenuOpen(!menuOpen);
                    }}
                  >
                    <a>MENSWEAR</a>
                    <svg
                      className={`header-icn ${activeBtn === "menswear" && menuOpen ? "flipped" : ""}`}
                      width="7"
                      height="6"
                      viewBox="0 0 7 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.03113 5.25L3.95596e-05 -5.70966e-07L6.06222 -4.09935e-08L3.03113 5.25Z"
                        fill="#EFEFEF"
                      />
                    </svg>
                  </div>
                  <div
                    className="header-btn"
                    onClick={() => {
                      setActiveBtn(
                        activeBtn === "womenswear" ? null : "womenswear",
                      );
                      setMenuOpen(!menuOpen);
                    }}
                  >
                    <a>WOMENSWEAR</a>
                    <svg
                      className={`header-icn ${activeBtn === "womenswear" && menuOpen ? "flipped" : ""}`}
                      width="7"
                      height="6"
                      viewBox="0 0 7 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.03113 5.25L3.95596e-05 -5.70966e-07L6.06222 -4.09935e-08L3.03113 5.25Z"
                        fill="#EFEFEF"
                      />
                    </svg>
                  </div>
                  <div
                    className="header-btn"
                    onClick={() => setActiveBtn("sneakers")}
                  >
                    <a>SNEAKERS</a>
                  </div>
                  <div
                    className="header-btn"
                    onClick={() => {
                      setActiveBtn(
                        activeBtn === "designers" ? null : "designers",
                      );
                      setMenuOpen(!menuOpen);
                    }}
                  >
                    <a>DESIGNERS</a>
                    <svg
                      className={`header-icn ${activeBtn === "designers" && menuOpen ? "flipped" : ""}`}
                      width="7"
                      height="6"
                      viewBox="0 0 7 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.03113 5.25L3.95596e-05 -5.70966e-07L6.06222 -4.09935e-08L3.03113 5.25Z"
                        fill="#EFEFEF"
                      />
                    </svg>
                  </div>
                </div>
                <a>ABOUT</a>
                <a href="https://github.com/misanthropicinc">GITHUB</a>
              </div>
              <span className="border-nav"></span>
              <div className={`nav-btns ${searchOpen ? "search-active" : ""}`}>
                <div
                  className={`search-bar-wrapper ${searchOpen ? "open" : ""}`}
                >
                  <a
                    className="search-trigger"
                    onClick={() => setSearchOpen(!searchOpen)}
                  >
                    <svg
                      className="header-icn search-trigger-icn"
                      width="14"
                      height="14"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.83333 7.83333L11.5 11.5M4.77778 9.05556C2.41523 9.05556 0.5 7.14033 0.5 4.77778C0.5 2.41523 2.41523 0.5 4.77778 0.5C7.14033 0.5 9.05556 2.41523 9.05556 4.77778C9.05556 7.14033 7.14033 9.05556 4.77778 9.05556Z"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                  <div className="search-bar">
                    <svg
                      className="searchIcn"
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.83333 7.83333L11.5 11.5M4.77778 9.05556C2.41523 9.05556 0.5 7.14033 0.5 4.77778C0.5 2.41523 2.41523 0.5 4.77778 0.5C7.14033 0.5 9.05556 2.41523 9.05556 4.77778C9.05556 7.14033 7.14033 9.05556 4.77778 9.05556Z"
                        fill="none"
                        stroke="#101010"
                        strokeWidth="1"
                      />
                    </svg>
                    <span className="search-divider"></span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="SEARCH..."
                    />
                  </div>
                </div>
                <a href="#">
                  <svg
                    className="header-icn"
                    width="14"
                    height="14"
                    viewBox="0 0 14 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 4.2002V13.6854C1 15.0464 1 15.7268 1.20412 16.1433C1.58245 16.9151 2.41157 17.3588 3.26367 17.2454C3.7234 17.1842 4.28964 16.8067 5.4221 16.0518L5.42481 16.0499C5.87368 15.7507 6.09815 15.6011 6.33295 15.5181C6.76421 15.3656 7.23476 15.3656 7.66602 15.5181C7.90129 15.6012 8.12664 15.7515 8.57732 16.0519C9.70978 16.8069 10.2767 17.1841 10.7364 17.2452C11.5885 17.3586 12.4176 16.9151 12.7959 16.1433C13 15.7269 13 15.0462 13 13.6854V4.19691C13 3.07899 13 2.5192 12.7822 2.0918C12.5905 1.71547 12.2837 1.40973 11.9074 1.21799C11.4796 1 10.9203 1 9.8002 1H4.2002C3.08009 1 2.51962 1 2.0918 1.21799C1.71547 1.40973 1.40973 1.71547 1.21799 2.0918C1 2.51962 1 3.08009 1 4.2002Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a href="#">
                  <svg
                    className="header-icn"
                    width="14"
                    height="14"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.5 0.5H0.697752C1.04689 0.5 1.22177 0.5 1.36417 0.562991C1.48972 0.618528 1.59707 0.707944 1.67448 0.821327C1.76213 0.949715 1.79378 1.12115 1.85696 1.46337L3.44774 10.0801L11.1278 10.0801C11.4618 10.0801 11.6293 10.0801 11.7676 10.0211C11.8899 9.96892 11.9952 9.8845 12.0735 9.77714C12.162 9.65575 12.1995 9.49325 12.2744 9.16856L12.275 9.16625L13.4314 4.15513L13.4317 4.15408C13.5453 3.66154 13.6023 3.41466 13.5397 3.22102C13.4849 3.05111 13.3693 2.90706 13.2161 2.81537C13.0414 2.71078 12.7889 2.71078 12.2825 2.71078H2.34232M11.5539 13.7647C11.1469 13.7647 10.817 13.4348 10.817 13.0278C10.817 12.6208 11.1469 12.2908 11.5539 12.2908C11.9609 12.2908 12.2908 12.6208 12.2908 13.0278C12.2908 13.4348 11.9609 13.7647 11.5539 13.7647ZM4.18464 13.7647C3.77765 13.7647 3.44771 13.4348 3.44771 13.0278C3.44771 12.6208 3.77765 12.2908 4.18464 12.2908C4.59163 12.2908 4.92157 12.6208 4.92157 13.0278C4.92157 13.4348 4.59163 13.7647 4.18464 13.7647Z"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a href="#">
                  <svg
                    className="header-icn"
                    width="14"
                    height="14"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.9766 12.5357C10.0321 11.4808 8.65975 10.817 7.13235 10.817C5.60495 10.817 4.23248 11.4808 3.28795 12.5357M7.13235 13.7647C3.46941 13.7647 0.5 10.7953 0.5 7.13235C0.5 3.46941 3.46941 0.5 7.13235 0.5C10.7953 0.5 13.7647 3.46941 13.7647 7.13235C13.7647 10.7953 10.7953 13.7647 7.13235 13.7647ZM7.13235 8.60621C5.91137 8.60621 4.92157 7.61641 4.92157 6.39542C4.92157 5.17444 5.91137 4.18464 7.13235 4.18464C8.35334 4.18464 9.34314 5.17444 9.34314 6.39542C9.34314 7.61641 8.35334 8.60621 7.13235 8.60621Z"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </nav>
          {menuOpen && (
            <HeaderMenu
              isOpen={menuOpen}
              isSticky={state.isSticky}
              onClose={() => setMenuOpen(false)}
              category={activeBtn === "womenswear" ? "womenswear" : "menswear"}
            />
          )}
        </header>
      </div>
    </section>
  );
}
