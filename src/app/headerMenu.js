import "./headerMenu.css";
import HeaderMenuCategory from "./headerMenuCategories";

const MENSWEAR_DATA = [
  {
    title: "TOPS",
    items: ["longsleeves", "hoodies", "t-shirts", "tank tops", "polos"]
  },
  {
    title: "BOTTOMS",
    items: ["denim", "casual pants", "shorts", "sweatpants & joggers"]
  },
  {
    title: "OUTWEAR",
    items: ["heavy coats", "bombers", "denim jackets", "light jackets"]
  },
  {
    title: "FOOTWEAR",
    items: ["boots", "formal shoes", "hi-top sneakers", "low-top sneakers"]
  }
];

const WOMENSWEAR_DATA = [
  {
    title: "TOPS",
    items: ["blouses", "bodysuits", "crop-tops", "longsleeves"]
  },
  {
    title: "BOTTOMS",
    items: ["denim", "casual pants", "shorts", "sweatpants & joggers"]
  },
  {
    title: "OUTWEAR",
    items: ["blazers", "coats", "denim jackets", "light jackets", "vests"]
  },
  {
    title: "FOOTWEAR",
    items: ["boots", "heels", "hi-top sneakers", "low-top sneakers"]
  }
];

export default function HeaderMenu({ isOpen, isSticky, onClose, category = "menswear" }) {
  const data = category === "womenswear" ? WOMENSWEAR_DATA : MENSWEAR_DATA;
  const title = category === "womenswear" ? "SHOP WOMENSWEAR" : "SHOP MENSWEAR";

  return (
    <>
      {isOpen && (
        <div
          className={`menu-backdrop ${isSticky ? "sticky" : ""}`}
          onClick={onClose}
        />
      )}
      <div
        className={`header-menu ${isOpen ? "open" : ""} ${isSticky ? "down" : "up"}`}
      >
        <div className="menu-content-wrapper">
          <div className="menu-content">
            <a className="menu-title">{title}</a>
            <div className="menu-categories">
              {data.map((cat, i) => (
                <HeaderMenuCategory key={i} title={cat.title} items={cat.items} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
