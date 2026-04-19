import "./headerMenuCategories.css";

export default function HeaderMenuCategory({ title, items }) {
  return (
    <div className="menu-category">
      <a className="menu-category-title">{title}</a>
      <div className="cat-btns">
        {items.map((item, i) => (
          <a key={i} className="menu-category-btn">{item}</a>
        ))}
      </div>
    </div>
  );
}
