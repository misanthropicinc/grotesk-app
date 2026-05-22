import "./headerMenuCategories.css";
import Link from "next/link";

function toQueryType(label) {
  const mapping = {
    "longsleeves": "Longsleeve",
    "hoodies": "Hoodie",
    "t-shirts": "T-Shirt",
    "tank tops": "Tank Top",
    "polos": "Polo Shirt",
    "denim": "Jeans",
    "casual pants": "Trousers",
    "shorts": "Shorts",
    "sweatpants & joggers": "Sweatpants",
    "heavy coats": "Coat",
    "bombers": "Bomber Jacket",
    "denim jackets": "Denim Jacket",
    "light jackets": "Jacket",
    "boots": "Boots",
    "formal shoes": "Dress Shoes",
    "hi-top sneakers": "Sneakers",
    "low-top sneakers": "Sneakers",
    "blouses": "Blouse",
    "bodysuits": "Bodysuit",
    "crop-tops": "Crop Top",
    "heels": "Heels",
    "blazers": "Blazer",
    "coats": "Coat",
    "vests": "Vest",
  };
  return mapping[label.toLowerCase()] || label;
}

export default function HeaderMenuCategory({ title, items, gender = "male" }) {
  return (
    <div className="menu-category">
      <a className="menu-category-title">{title}</a>
      <div className="cat-btns">
        {items.map((item, i) => (
          <Link key={i} className="menu-category-btn" href={`/catalog?gender=${gender}&type=${encodeURIComponent(toQueryType(item))}`}>
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}
