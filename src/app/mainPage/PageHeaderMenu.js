import "./pageHeader.css";
import PageHeaderMenuCategory from "./PageHeaderMenuCategory";

const MENSWEAR_DATA = [
  {
    title: "TOPS",
    items: ["longsleeves", "hoodies", "t-shirts", "tank tops", "polos"],
  },
  {
    title: "BOTTOMS",
    items: ["denim", "casual pants", "shorts", "sweatpants & joggers"],
  },
  {
    title: "OUTWEAR",
    items: ["heavy coats", "bombers", "denim jackets", "light jackets"],
  },
  {
    title: "FOOTWEAR",
    items: ["boots", "formal shoes", "hi-top sneakers", "low-top sneakers"],
  },
];

const WOMENSWEAR_DATA = [
  {
    title: "TOPS",
    items: ["blouses", "bodysuits", "crop-tops", "longsleeves"],
  },
  {
    title: "BOTTOMS",
    items: ["denim", "casual pants", "shorts", "sweatpants & joggers"],
  },
  {
    title: "OUTWEAR",
    items: ["blazers", "coats", "denim jackets", "light jackets", "vests"],
  },
  {
    title: "FOOTWEAR",
    items: ["boots", "heels", "hi-top sneakers", "low-top sneakers"],
  },
];

export default function PageHeaderMenu({
  isOpen,
  isSticky,
  onClose,
  category = "menswear",
}) {
  const data = category === "womenswear" ? WOMENSWEAR_DATA : MENSWEAR_DATA;
  const title = category === "womenswear" ? "SHOP WOMENSWEAR" : "SHOP MENSWEAR";

  return (
    <>
      {isOpen && (
        <div
          className={`page-header-backdrop ${isSticky ? "sticky" : ""}`}
          onClick={onClose}
        />
      )}
      <div
        className={`page-header-menu ${isOpen ? "open" : ""} down`}
      >
        <div className="page-header-menu-content-wrapper">
          <div className="page-header-menu-content">
            <a className="page-header-menu-title">{title}</a>
            <div className="page-header-menu-categories">
              {data.map((cat, i) => (
                <PageHeaderMenuCategory
                  key={i}
                  title={cat.title}
                  items={cat.items}
                  gender={category === "womenswear" ? "female" : "male"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}