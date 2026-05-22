"use client";

import "./recommendCategory.css";

function getThumbnail(item) {
  const idx = item.thumbnailIndex ?? 0;
  const all = (item.colors || []).flatMap((c) => c.images || []);
  return all[idx] || all[0] || item.images?.[0] || "";
}

export default function RecommendCategory({ card }) {
  if (!card) return null;

  let label, imgSrc, linkHref;

  if (card.source === "item") {
    const item = card.data;
    label = (item.type || "ITEM").toUpperCase();
    imgSrc = getThumbnail(item);
    linkHref = `/catalog?type=${encodeURIComponent(item.type || "")}&gender=${encodeURIComponent(item.gender || "")}`;
  } else {
    const fb = card.data;
    label = fb.label;
    imgSrc = null;
    linkHref = `/catalog?type=${encodeURIComponent(fb.type)}&gender=${encodeURIComponent(fb.gender || "")}`;
  }

  return (
    <a href={linkHref} className="recommendCat">
      <div className="recommendCatTitle">
        <p>{label}</p>
      </div>
      <div className="recommendCatImg">
        {imgSrc ? (
          <img src={imgSrc} alt={label.toLowerCase()} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#999" }}>NO IMAGE</div>
        )}
      </div>
      <div className="recommendCatOverlay">
        <p>{label}</p>
      </div>
    </a>
  );
}
