import "./headerMenu.css";
import HeaderMenuCategory from "./headerMenuCategories";

export default function HeaderMenu({ isOpen, isSticky, onClose }) {
  return (
    <>
      {isOpen && (
        <div className={`menu-backdrop ${isSticky ? "sticky" : ""}`} onClick={onClose} />
      )}
      <div className={`header-menu ${isOpen ? "open" : ""} ${isSticky ? "down" : "up"}`}>
        <div className="menu-content"></div>
      </div>
    </>
  );
}
