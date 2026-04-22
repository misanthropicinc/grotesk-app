import "./ItemCard.css";

export default function ItemCard() {
  return (
    <div className="item-card-main">
      <div className="item-card-img"></div>
      <div className="item-card-info">
        <div className="item-card-content-top">
          <div className="item-card-brand-text">
            <p className="item-card-item-title">ITEM TITLE</p>
            <p className="item-card-brand-title">BRAND TITLE</p>
          </div>
          <p className="item-card-item-price">$69420.00</p>
        </div>
        <div className="item-card-content-bottom"></div>
      </div>
    </div>
  );
}
