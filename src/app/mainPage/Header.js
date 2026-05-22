"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "./header.css";
import "./heroSection.css";
import HeaderMenu from "./headerMenu";
import HeaderSearch from "./HeaderSearch";
import logoImg from "../../imgs/grotesk-header-logo.png";
import { getSession } from "../auth/authService";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeBtn, setActiveBtn] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1002,
      }}
    >
      <header
        className="heroHeader"
        style={{ position: "relative", bottom: "auto", top: "auto" }}
      >
        <nav>
          <a href="/" className="grotesk-header-logo">
            <Image
              src={logoImg}
              width={71}
              height={19}
              alt="logo"
              loading="eager"
            />
          </a>
          <div className="header-left">
            <div className="nav1left">
              <div className="nav-btns">
                <div
                  className="header-btn"
                  onClick={() => {
                    setActiveBtn(activeBtn === "menswear" ? null : "menswear");
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
                <div className="header-btn">
                  <a href="/catalog?type=Sneakers&gender=Male">SNEAKERS</a>
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
              <a href="/about">ABOUT</a>
              <a href="https://github.com/misanthropicinc">GITHUB</a>
            </div>
            <span className="border-nav"></span>
            <div className={`nav-btns ${searchOpen ? "search-active" : ""}`}>
              <div className={`search-bar-wrapper ${searchOpen ? "open" : ""}`}>
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
                  <HeaderSearch inputClass="search-input" dropdownUp />
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
            {session ? (
              <a href="/profile">
                <svg
                  className="header-icn"
                  width="14"
                  height="14"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.9766 12.5357C10.0321 11.4808 8.65975 10.817 7.13235 10.817C5.60495 10.817 4.23248 11.4808 3.28795 12.5357M7.13235 13.7647C3.46941 13.7647 0.5 10.7953 0.5 7.13235C0.5 3.46941 3.46941 0.5 7.13235 0.5C10.7953 0.5 13.7647 3.46941 13.7647 7.13235C13.7647 10.7953 10.7953 13.7647 7.13235 13.7647ZM7.13235 8.60621C5.91137 8.60621 4.92157 7.61641 4.92157 6.39542C4.92157 5.17444 5.91137 4.18464 7.13235 4.18464C8.35334 8.18464 9.34314 5.17444 9.34314 6.39542C9.34314 7.61641 8.35334 8.60621 7.13235 8.60621Z"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ) : (
              <>
                <a href="/auth?mode=signup" className="header-auth-btn">SIGN UP</a>
                <a href="/auth?mode=login" className="header-auth-btn">LOG IN</a>
              </>
            )}
            </div>
          </div>
        </nav>
        {menuOpen && (
          <HeaderMenu
            isOpen={menuOpen}
            isSticky={false}
            onClose={() => setMenuOpen(false)}
            category={activeBtn === "womenswear" ? "womenswear" : "menswear"}
          />
        )}
      </header>
    </div>
  );
}
