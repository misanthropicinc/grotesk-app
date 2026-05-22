import Image from "next/image";
import "./itemmenu.css";

export default function ItemMenu({ item }) {
  const title = item?.title?.toLowerCase() || "item";
  const collection = item?.collection?.toLowerCase() || "";
  const price = item ? `$ ${parseFloat(item.price || 0).toFixed(2)}` : "$ 0.00";
  const colorNames = item ? (item.colors || []).map((c) => c.name).join("/") : "";
  const desc = item?.description || "";
  const brandLogo = item?.brand === "DRKSHDW" ? "/brandlogodesc.png" : null;

  return (
    <div className="slider-menu">
      {brandLogo ? (
        <Image src={brandLogo} alt="Brand Logo" width={247} height={28} className="menu-logo" />
      ) : (
        <div className="menu-logo-placeholder">NO LOGO</div>
      )}
      <div className="menu-title-row">
        <div className="menu-title-texts">
          <p className="menu-item-name">{title}</p>
          {collection && <p className="menu-collection">{collection}</p>}
        </div>
        <p className="menu-price">{price}</p>
      </div>
      <div className="menu-description">
        {desc}
        <br />
        <br />
        {colorNames ? `COLOR: ${colorNames}` : ""}
      </div>
    </div>
  );
}
