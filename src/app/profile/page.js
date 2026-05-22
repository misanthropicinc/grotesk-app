"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";
import {
  getSession,
  getCurrentUser,
  logout,
  updateUserProfile,
  ensureAdminAccount,
  isAdmin,
} from "../auth/authService";
import {
  addItem,
  getUserItems,
  deleteItem,
  getFavoriteItems,
  addFavorite,
  removeFavorite,
  getFavorites,
  convertFileToDataURL,
  updateItem,
  getItemById,
  seedDefaultItem,
} from "./profileService";
import { getUserOrders } from "../orders/ordersService";
import "./profile.css";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Mali","Mauritania","Mauritius","Mexico","Moldova","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

const GARMENT_TYPES = [
  "T-Shirt","Hoodie","Sweatshirt","Jacket","Coat","Blazer","Jeans","Trousers","Shorts","Sweatpants","Cargo Pants","Shoes","Sneakers","Boots","Dress Shoes","Sandals","Shirt","Dress Shirt","Polo Shirt","Suit","Vest","Skirt","Dress","Jumpsuit","Overalls","Hat","Cap","Beanie","Scarf","Gloves","Belt","Tie","Socks","Underwear","Swimwear","Activewear","Loungewear","Sleepwear","Parka","Puffer Jacket","Bomber Jacket","Leather Jacket","Denim Jacket","Windbreaker","Cardigan","Turtleneck","Hoodie Dress","Tracksuit",
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BOTTOM_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "29", "30", "31", "32", "33", "34", "35", "36", "38", "40", "42", "44"];
const ACCESSORY_SIZES = ["OS", "XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const SHOE_STANDARDS = ["EU", "US", "IT", "RU"];
const GENDERS = ["Male", "Female", "Unisex"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

const BOTTOM_TYPES = ["Jeans", "Trousers", "Shorts", "Sweatpants", "Cargo Pants", "Skirt"];
const ACCESSORY_TYPES = ["Hat", "Cap", "Beanie", "Scarf", "Gloves", "Belt", "Tie", "Socks"];

function isShoeType(type) {
  return ["shoe", "sneaker", "boot", "sandal"].some((kw) =>
    type.toLowerCase().includes(kw)
  );
}

function getSizeOptions(type) {
  if (isShoeType(type)) return [...SHOE_SIZES, "CUSTOM"];
  if (BOTTOM_TYPES.includes(type)) return [...BOTTOM_SIZES, "CUSTOM"];
  if (ACCESSORY_TYPES.includes(type)) return [...ACCESSORY_SIZES, "CUSTOM"];
  return [...CLOTHING_SIZES, "CUSTOM"];
}

function MultiSizeSelect({ selected, onChange, options }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  function toggle(opt) {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  }

  function addCustom() {
    const val = customInput.trim();
    if (!val) return;
    if (!selected.includes(val)) {
      onChange([...selected, val]);
    }
    setCustomInput("");
    setShowCustom(false);
  }

  function remove(val) {
    onChange(selected.filter((s) => s !== val));
  }

  const standardOpts = options.filter((o) => o !== "CUSTOM");

  return (
    <div>
      <div className="profile-size-grid">
        {standardOpts.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`profile-size-btn ${selected.includes(opt) ? "active" : ""}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
        <button
          type="button"
          className={`profile-size-btn ${showCustom ? "active" : ""}`}
          onClick={() => setShowCustom((v) => !v)}
        >
          + CUSTOM
        </button>
      </div>
      {showCustom && (
        <div className="profile-custom-size-row">
          <input
            className="profile-input"
            type="text"
            placeholder="Enter custom size"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          />
          <button type="button" className="profile-custom-size-add" onClick={addCustom}>ADD</button>
        </div>
      )}
      {selected.length > 0 && (
        <div className="profile-size-chips">
          {selected.map((s) => (
            <span key={s} className="profile-size-chip">
              {s}
              <button type="button" className="profile-size-chip-x" onClick={() => remove(s)}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchableSelect({ value, onChange, options, placeholder, style }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (!filter) return options;
    return options.filter((o) => o.toLowerCase().includes(filter.toLowerCase()));
  }, [filter, options]);

  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setFilter("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleInputChange(e) {
    setFilter(e.target.value);
    if (!open) setOpen(true);
  }

  function handleSelect(opt) {
    onChange({ target: { value: opt } });
    setOpen(false);
    setFilter("");
    inputRef.current?.blur();
  }

  const displayValue = value || "";

  return (
    <div className="profile-select-wrapper" ref={containerRef} style={style}>
      <input
        ref={inputRef}
        className="profile-select-input"
        type="text"
        placeholder={placeholder}
        value={open ? filter : displayValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="profile-select-dropdown">
          {filtered.length === 0 ? (
            <div className="profile-select-option disabled">NO MATCHES</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                className={`profile-select-option ${value === opt ? "active" : ""}`}
                onClick={() => handleSelect(opt)}
              >
                {opt === "CUSTOM" ? "+ CUSTOM SIZE" : opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [favItems, setFavItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [message, setMessage] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, height: "100vh" });

  const [role, setRole] = useState("");
  const [pfpPreview, setPfpPreview] = useState(null);
  const [designerName, setDesignerName] = useState("");
  const [designerLogoPreview, setDesignerLogoPreview] = useState(null);
  const [runwayGifs, setRunwayGifs] = useState([]);
  const [designerGenre, setDesignerGenre] = useState("");
  const [saving, setSaving] = useState(false);

  const [itemTitle, setItemTitle] = useState("");
  const [itemBrand, setItemBrand] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemCollection, setItemCollection] = useState("");
  const [itemType, setItemType] = useState("");
  const [itemGender, setItemGender] = useState("");
  const [itemCondition, setItemCondition] = useState("");
  const [itemSizes, setItemSizes] = useState([]);
  const [itemCustomSizes, setItemCustomSizes] = useState([]);
  const [itemColors, setItemColors] = useState([]);
  const [itemCountry, setItemCountry] = useState("");
  const [itemShoeStandard, setItemShoeStandard] = useState("");
  const [itemShoeModels, setItemShoeModels] = useState([]);
  const [postAs, setPostAs] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [itemThumbnailIndex, setItemThumbnailIndex] = useState(0);

  const pfpInputRef = useRef(null);
  const gifInputRef = useRef(null);
  const shoeFileInputRef = useRef(null);
  const menuOpenRef = useRef(false);

  const MENU_TOP = 35;

  function recalcMenuPos() {
    setMenuStyle({ top: MENU_TOP, height: `calc(100vh - ${MENU_TOP}px)` });
  }

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push("/auth");
      return;
    }
    setSession(s);
    ensureAdminAccount();
    seedDefaultItem();
    const u = getCurrentUser();
    setUser(u);
    if (u) {
      setRole(u.role || "");
      setPfpPreview(u.pfp || null);
      if (u.designerProfile) {
        setDesignerName(u.designerProfile.name || "");
        setDesignerLogoPreview(u.designerProfile.logo || null);
        setRunwayGifs(u.designerProfile.runwayGifs || []);
      }
      setUserItems(getUserItems(s.telegram));
      setFavItems(getFavoriteItems(s.telegram));
      setOrderItems(getUserOrders(s.telegram));
    }
    const editId = searchParams.get("editItemId");
    if (editId) {
      const item = getItemById(editId);
      if (item && (item.postedBy === s.telegram || isAdmin())) {
        openEditItem(item);
      }
    }
  }, []);

  const isShoe = isShoeType(itemType);
  const sizeOptions = useMemo(() => getSizeOptions(itemType), [itemType]);

  useEffect(() => {
    if (menuOpenRef.current) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [settingsOpen, addItemOpen]);

  if (!session) return null;

  const stats = {
    total: userItems.length,
    sold: userItems.filter((i) => i.sold).length,
    favCount: getFavorites(session.telegram).length,
  };

  function showMessage(text, type) {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  function handleRoleChange(newRole) {
    setRole(newRole);
    setPostAs("");
  }

  async function handlePfpUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await convertFileToDataURL(file);
    setPfpPreview(dataUrl);
    updateUserProfile(session.telegram, { pfp: dataUrl });
  }

  async function handleDesignerLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setDesignerLogoPreview(await convertFileToDataURL(file));
  }

  async function handleRunwayGifUpload(e) {
    const files = Array.from(e.target.files);
    const newGifs = [];
    for (const f of files) {
      newGifs.push(await convertFileToDataURL(f));
    }
    setRunwayGifs((prev) => [...prev, ...newGifs]);
  }

  async function handleSaveSettings() {
    setSaving(true);
    setMessage(null);
    const profileUpdates = { role };
    if (role === "designer") {
      if (!designerName.trim()) {
        showMessage("Designer name is required");
        setSaving(false);
        return;
      }
      profileUpdates.designerProfile = {
        name: designerName.trim(),
        logo: designerLogoPreview || "",
        runwayGifs,
      };
    }
    const result = updateUserProfile(session.telegram, profileUpdates);
    if (result.success) {
      showMessage("Settings saved", "success");
      setUser(getCurrentUser());
    } else {
      showMessage(result.error);
    }
    setSaving(false);
  }

  function removeRunwayGif(index) {
    setRunwayGifs((prev) => prev.filter((_, i) => i !== index));
  }

  function openSettings() {
    recalcMenuPos();
    menuOpenRef.current = true;
    setSettingsOpen(true);
  }

  function closeSettings() {
    menuOpenRef.current = false;
    setSettingsOpen(false);
  }

  function openAddItem() {
    setEditingItem(null);
    setItemTitle(""); setItemBrand(""); setItemPrice(""); setItemDescription("");
    setItemCollection("");
    setItemType(""); setItemGender(""); setItemCondition("");
    setItemSizes([]); setItemCustomSizes([]); setItemShoeStandard("");
    setItemColors([]);
    setItemCountry(""); setItemShoeModels([]);
    setItemThumbnailIndex(0);
    setPostAs("");
    if (shoeFileInputRef.current) shoeFileInputRef.current.value = "";
    recalcMenuPos();
    menuOpenRef.current = true;
    setAddItemOpen(true);
  }

  function openEditItem(item) {
    setEditingItem(item);
    setItemTitle(item.title || "");
    setItemBrand(item.brand || "");
    setItemPrice(String(item.price || ""));
    setItemDescription(item.description || "");
    setItemCollection(item.collection || "");
    setItemType(item.type || "");
    setItemGender(item.gender || "");
    setItemCondition(item.condition || "");
    setItemSizes(item.size ? item.size.split(",").map((s) => s.trim()).filter(Boolean) : []);
    setItemCustomSizes([]);
    setItemShoeStandard(item.shoeStandard || "");
    setItemCountry(item.sellerCountry || "");
    setPostAs(item.postedByRole === "designer" ? "designer" : item.postedByRole === "resaler" ? "resaler" : "");
    const colors = (item.colors || []).map((c) => ({
      name: c.name,
      hex: c.hex,
      images: c.images || [],
      previews: (c.images || []).slice(),
    }));
    setItemColors(colors);
    setItemThumbnailIndex(item.thumbnailIndex ?? 0);
    setItemShoeModels(item.shoeModels || []);
    if (shoeFileInputRef.current) shoeFileInputRef.current.value = "";
    recalcMenuPos();
    menuOpenRef.current = true;
    setAddItemOpen(true);
  }

  function closeAddItem() {
    menuOpenRef.current = false;
    setAddItemOpen(false);
    setEditingItem(null);
  }

  function addColorBlock() {
    setItemColors((prev) => [...prev, { name: "", hex: "#000000", images: [], previews: [] }]);
  }

  function updateColor(index, field, value) {
    setItemColors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function addColorImages(index, files) {
    for (const f of Array.from(files)) {
      const url = await convertFileToDataURL(f);
      setItemColors((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          images: [...updated[index].images, url],
          previews: [...updated[index].previews, url],
        };
        return updated;
      });
    }
  }

  function removeColorImage(colorIndex, imageIndex) {
    setItemColors((prev) => {
      const updated = [...prev];
      updated[colorIndex] = {
        ...updated[colorIndex],
        images: updated[colorIndex].images.filter((_, i) => i !== imageIndex),
        previews: updated[colorIndex].previews.filter((_, i) => i !== imageIndex),
      };
      return updated;
    });
  }

  function removeColorBlock(index) {
    setItemColors((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmitItem(e) {
    e.preventDefault();
    setMessage(null);

    if (!itemTitle.trim()) return showMessage("Item title is required");
    if (!itemBrand.trim()) return showMessage("Brand is required");
    if (!itemPrice.trim()) return showMessage("Price is required");
    if (!itemType) return showMessage("Type of garment is required");
    if (!itemGender) return showMessage("Gender is required");
    if (!itemCondition) return showMessage("Condition is required");

    if (itemSizes.length === 0) return showMessage("At least one size is required");
    if (!itemCountry) return showMessage("Seller country is required");
    if (isShoe && !itemShoeStandard) return showMessage("Shoe standard is required (EU/US/IT/RU)");

    const validColors = itemColors.filter((c) => c.name.trim());
    if (validColors.length === 0) return showMessage("At least one color with a name is required");

    let postedByRole = role;
    let postedByName = session.telegram;

    if (role === "superuser") {
      if (!postAs) return showMessage("Select whether to post as Designer or Resaler");
      postedByRole = postAs;
      postedByName = postAs === "designer"
        ? (getCurrentUser()?.designerProfile?.name || session.telegram)
        : session.telegram;
    } else if (role === "designer") {
      postedByName = getCurrentUser()?.designerProfile?.name || session.telegram;
    }

    const itemData = {
      title: itemTitle.trim(),
      brand: itemBrand.trim(),
      price: itemPrice.trim(),
      description: itemDescription.trim(),
      collection: itemCollection.trim(),
      type: itemType,
      gender: itemGender,
      condition: itemCondition,
      size: itemSizes.join(", "),
      shoeStandard: isShoe ? itemShoeStandard : "",
      colors: validColors.map((c) => ({
        name: c.name.trim(),
        hex: c.hex,
        images: c.images,
      })),
      sellerCountry: itemCountry,
      shoeModels: itemShoeModels,
      postedBy: session.telegram,
      postedByRole,
      postedByName,
      thumbnailIndex: itemThumbnailIndex,
    };

    if (editingItem) {
      updateItem(editingItem.id, itemData);
      showMessage("Item updated successfully", "success");
    } else {
      addItem(itemData);
      showMessage("Item posted successfully", "success");
    }

    setUserItems(getUserItems(session.telegram));
    closeAddItem();
  }

  function handleDeleteItem(id) {
    deleteItem(id);
    setUserItems(getUserItems(session.telegram));
    showMessage("Item deleted", "success");
  }

  function handleLogout() {
    logout();
    router.push("/auth");
  }

  function toggleFavorite(itemId) {
    const favs = getFavorites(session.telegram);
    if (favs.includes(itemId)) {
      removeFavorite(session.telegram, itemId);
    } else {
      addFavorite(session.telegram, itemId);
    }
    setFavItems(getFavoriteItems(session.telegram));
  }

  function totalImages() {
    return itemColors.reduce((sum, c) => sum + c.images.length, 0);
  }

  function flatImageIndex(colorIdx, imageIdx) {
    let idx = 0;
    for (let c = 0; c < colorIdx; c++) {
      idx += (itemColors[c]?.images?.length || 0);
    }
    return idx + imageIdx;
  }

  return (
    <>
      <PageHeader />
      <Breadcrumbs />
      <div className="profile-page">
        <div className="profile-top-bar">
          <div className="profile-top-left">
            <div className="profile-pfp" onClick={() => pfpInputRef.current?.click()}>
              {pfpPreview ? (
                <img src={pfpPreview} alt="pfp" />
              ) : (
                <span>{session.telegram[0].toUpperCase()}</span>
              )}
              <div className="profile-pfp-overlay">CHANGE</div>
            </div>
            <input ref={pfpInputRef} type="file" accept="image/*" hidden onChange={handlePfpUpload} />
            <div className="profile-top-info">
              <h1 className="profile-username">@{session.telegram}</h1>
              <span className={`profile-role-badge profile-role-badge--${role || "regular"}`}>
                {role ? role.toUpperCase() : "REGULAR"}
              </span>
            </div>
          </div>
          <div className="profile-top-right">
            <button className="profile-action-btn" onClick={openAddItem}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              NEW ITEM
            </button>
            <button className="profile-action-btn" onClick={openSettings}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              SETTINGS
            </button>
            <button className="profile-logout-btn" onClick={handleLogout}>LOG OUT</button>
          </div>
        </div>

        {message && (
          <div className={`profile-message profile-message--${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-stats">
          <div className="profile-stat-card">
            <span className="profile-stat-number">{stats.total}</span>
            <span className="profile-stat-label">LISTINGS</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-number">{stats.sold}</span>
            <span className="profile-stat-label">SOLD</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-number">{stats.favCount}</span>
            <span className="profile-stat-label">WISHLISTED</span>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">FAVORITES ({favItems.length})</h2>
          {favItems.length === 0 ? (
            <p className="profile-empty">No favorited items yet.</p>
          ) : (
            <div className="profile-mini-grid">
              {favItems.map((item) => (
                <div key={item.id} className="profile-mini-card" onClick={() => router.push(`/item?id=${item.id}`)}>
                  <div className="profile-mini-card-img">
                    {item.colors?.[0]?.images?.[0] ? (
                      <img src={item.colors[0].images[0]} alt={item.title} />
                    ) : item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} />
                    ) : (
                      <div className="profile-mini-noimg">NO IMAGE</div>
                    )}
                  </div>
                  <div className="profile-mini-card-info">
                    <p className="profile-mini-card-title">{item.title}</p>
                    <p className="profile-mini-card-brand">{item.brand}</p>
                    <p className="profile-mini-card-price">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">MY ITEMS ({userItems.length})</h2>
          {userItems.length === 0 ? (
            <p className="profile-empty">No items posted yet.</p>
          ) : (
            <div className="profile-grid">
              {userItems.map((item) => (
                <div key={item.id} className="profile-grid-card">
                  <div className="profile-grid-card-img">
                    {item.colors?.[0]?.images?.[0] ? (
                      <img src={item.colors[0].images[0]} alt={item.title} />
                    ) : item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} />
                    ) : (
                      <div className="profile-grid-noimg">NO IMAGE</div>
                    )}
                  </div>
                  <div className="profile-grid-card-info">
                    <p className="profile-grid-card-title">{item.title}</p>
                    <p className="profile-grid-card-brand">{item.brand}</p>
                    <p className="profile-grid-card-price">${item.price}</p>
                    <div className="profile-grid-card-meta">
                      <span className="profile-grid-card-role">{item.postedByRole?.toUpperCase()}</span>
                      {item.size && <span className="profile-grid-card-size">{item.size}</span>}
                      {item.collection && <span className="profile-grid-card-collection">{item.collection}</span>}
                    </div>
                    <div className="profile-grid-card-actions">
                      <button className="profile-item-edit" onClick={() => openEditItem(item)}>EDIT</button>
                      <button className="profile-item-delete" onClick={() => handleDeleteItem(item.id)}>DELETE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2 className="profile-section-title">ORDERS ({orderItems.length})</h2>
          {orderItems.length === 0 ? (
            <p className="profile-empty">No orders yet.</p>
          ) : (
            <div className="profile-orders-list">
              {orderItems.map((order) => (
                <div key={order.id} className="profile-order-card" onClick={() => router.push(`/order?id=${order.id}`)}>
                  <div className="profile-order-left">
                    <p className="profile-order-id">{order.id}</p>
                    <p className="profile-order-total">${(order.total || 0).toLocaleString()}</p>
                  </div>
                  <div className="profile-order-right">
                    <span className={`profile-order-status profile-order-status--${order.status}`}>{order.status.toUpperCase()}</span>
                    <span className="profile-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`profile-menu-overlay ${settingsOpen || addItemOpen ? "visible" : ""}`} onClick={() => { closeSettings(); closeAddItem(); }} />
      <div className="profile-menu-dummy" style={{ display: "none" }} />

      <div className={`profile-slide-menu ${settingsOpen ? "open" : ""}`} style={{ top: menuStyle.top, height: menuStyle.height }}>
        <div className="profile-slide-inner">
          <div className="profile-slide-header">
            <h3>SETTINGS</h3>
            <button className="profile-slide-close" onClick={closeSettings}>×</button>
          </div>

          <div className="profile-field">
            <label className="profile-label">STATUS</label>
            <div className="profile-inline-options">
              {["", "designer", "resaler", "superuser"].map((v) => (
                <button key={v} type="button" className={`profile-inline-opt ${role === v ? "active" : ""}`} onClick={() => handleRoleChange(v)}>
                  {v ? v.toUpperCase() : "REGULAR"}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-field">
            <label className="profile-label">PROFILE PICTURE</label>
            <label className="profile-file-btn">
              {pfpPreview ? "CHANGE PFP" : "UPLOAD PFP"}
              <input type="file" accept="image/*" hidden onChange={handlePfpUpload} />
            </label>
          </div>

          {role === "designer" && (
            <>
              <div className="profile-field">
                <label className="profile-label">DESIGNER NAME</label>
                <input className="profile-input" type="text" placeholder="e.g. Rick Owens" value={designerName} onChange={(e) => setDesignerName(e.target.value)} />
              </div>
              <div className="profile-field">
                <label className="profile-label">LOGO</label>
                {designerLogoPreview && <img src={designerLogoPreview} alt="logo" className="profile-settings-logo-preview" />}
                <label className="profile-file-btn">
                  {designerLogoPreview ? "CHANGE LOGO" : "UPLOAD LOGO"}
                  <input type="file" accept="image/*" hidden onChange={handleDesignerLogoUpload} />
                </label>
              </div>
              <div className="profile-field">
                <label className="profile-label">RUNWAY GIFS ({runwayGifs.length})</label>
                {runwayGifs.map((gif, i) => (
                  <div key={i} className="profile-settings-file-row"><span>GIF {i + 1}</span><button onClick={() => removeRunwayGif(i)}>×</button></div>
                ))}
                <label className="profile-file-btn">
                  + ADD GIF
                  <input ref={gifInputRef} type="file" accept="image/gif,video/mp4,video/webm" hidden multiple onChange={handleRunwayGifUpload} />
                </label>
              </div>
            </>
          )}

          {role === "resaler" && <p className="profile-settings-note">Items labeled RESALER under @{session.telegram}. No 3D shoe uploads.</p>}
          {role === "superuser" && <p className="profile-settings-note">Superusers can post as Designer or Resaler per item.</p>}

          <button className="profile-save-btn" onClick={handleSaveSettings} disabled={saving}>
            {saving ? "SAVING..." : "SAVE SETTINGS"}
          </button>
        </div>
      </div>

      <div className={`profile-slide-menu ${addItemOpen ? "open" : ""}`} style={{ top: menuStyle.top, height: menuStyle.height }}>
        <div className="profile-slide-inner">
          <div className="profile-slide-header">
            <h3>{editingItem ? "EDIT ITEM" : "NEW ITEM"}</h3>
            <button className="profile-slide-close" onClick={closeAddItem}>×</button>
          </div>

          <form onSubmit={handleSubmitItem} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="profile-field">
              <label className="profile-label">TITLE *</label>
              <input className="profile-input" type="text" placeholder="Item title" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} />
            </div>
            <div className="profile-field">
              <label className="profile-label">BRAND *</label>
              <input className="profile-input" type="text" placeholder="Brand name" value={itemBrand} onChange={(e) => setItemBrand(e.target.value)} />
            </div>
            <div className="profile-field">
              <label className="profile-label">PRICE *</label>
              <input className="profile-input" type="text" placeholder="$ 0.00" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
            </div>
            <div className="profile-field">
              <label className="profile-label">DESCRIPTION</label>
              <textarea className="profile-textarea" placeholder="Item description" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} />
            </div>
            <div className="profile-field">
              <label className="profile-label">COLLECTION</label>
              <input className="profile-input" type="text" placeholder="e.g. SS26 Temple" value={itemCollection} onChange={(e) => setItemCollection(e.target.value)} />
            </div>
            <div className="profile-field">
              <label className="profile-label">TYPE *</label>
              <SearchableSelect value={itemType} onChange={(e) => { setItemType(e.target.value); setItemSize(""); setItemShoeStandard(""); }} options={GARMENT_TYPES} placeholder="SELECT TYPE" />
            </div>
            <div className="profile-field">
              <label className="profile-label">GENDER *</label>
              <SearchableSelect value={itemGender} onChange={(e) => setItemGender(e.target.value)} options={GENDERS} placeholder="SELECT GENDER" />
            </div>
            <div className="profile-field">
              <label className="profile-label">CONDITION *</label>
              <SearchableSelect value={itemCondition} onChange={(e) => setItemCondition(e.target.value)} options={CONDITIONS} placeholder="SELECT CONDITION" />
            </div>
            <div className="profile-field">
              <label className="profile-label">SIZE(S) *</label>
              <MultiSizeSelect selected={itemSizes} onChange={setItemSizes} options={sizeOptions} />
            </div>
            {isShoe && (
              <div className="profile-field">
                <label className="profile-label">SHOE STANDARD *</label>
                <SearchableSelect value={itemShoeStandard} onChange={(e) => setItemShoeStandard(e.target.value)} options={SHOE_STANDARDS} placeholder="SELECT STANDARD" />
              </div>
            )}
            <div className="profile-field">
              <label className="profile-label">COLORS ({itemColors.length}) *</label>
              {itemColors.map((color, ci) => (
                <div key={ci} className="profile-color-block">
                  <div className="profile-color-block-header">
                    <span className="profile-color-block-label">COLOR {ci + 1}</span>
                    <button type="button" className="profile-color-remove-btn" onClick={() => removeColorBlock(ci)}>×</button>
                  </div>
                  <div className="profile-color-row">
                    <input className="profile-input profile-color-picker" type="color" value={color.hex} onChange={(e) => updateColor(ci, "hex", e.target.value)} />
                    <input className="profile-input" type="text" placeholder="Color name" value={color.name} onChange={(e) => updateColor(ci, "name", e.target.value)} style={{ flex: 1 }} />
                  </div>
                  <div className="profile-color-images">
                    {color.previews.map((prev, ii) => {
                      const fi = flatImageIndex(ci, ii);
                      return (
                        <div key={ii} className={`profile-color-image-preview ${itemThumbnailIndex === fi ? "is-thumbnail" : ""}`}>
                          <img src={prev} alt="" />
                          <button type="button" className="profile-image-thumb-btn" onClick={() => setItemThumbnailIndex(fi)} title="Set as thumbnail">
                            {itemThumbnailIndex === fi ? "THUMBNAIL" : "THUMB"}
                          </button>
                          <button type="button" className="profile-image-remove" onClick={() => removeColorImage(ci, ii)}>×</button>
                        </div>
                      );
                    })}
                    <label className="profile-color-image-add">
                      <span>+</span>
                      <input type="file" accept="image/*" hidden multiple onChange={(e) => addColorImages(ci, e.target.files)} />
                    </label>
                  </div>
                </div>
              ))}
              <button type="button" className="profile-add-color-btn" onClick={addColorBlock}>
                + ADD COLOR
              </button>
            </div>
            <div className="profile-field">
              <label className="profile-label">SELLER COUNTRY *</label>
              <SearchableSelect value={itemCountry} onChange={(e) => setItemCountry(e.target.value)} options={COUNTRIES} placeholder="SELECT COUNTRY" />
            </div>
            {isShoe && (
              <div className="profile-field">
                <label className="profile-label">3D MODELS ({itemShoeModels.length})</label>
                {itemShoeModels.map((m, i) => (
                  <div key={i} className="profile-settings-file-row"><span>{m.name}</span><button type="button" onClick={() => removeItemShoeModel(i)}>×</button></div>
                ))}
                <label className="profile-file-btn">
                  + UPLOAD .glb
                  <input ref={shoeFileInputRef} type="file" accept=".glb,.gltf" hidden multiple onChange={(e) => {
                    const files = Array.from(e.target.files);
                    Promise.all(files.map(async (f) => ({
                      name: f.name,
                      url: await convertFileToDataURL(f),
                    }))).then((models) => setItemShoeModels((prev) => [...prev, ...models]));
                  }} />
                </label>
              </div>
            )}
            {role === "superuser" && (
              <div className="profile-field">
                <label className="profile-label">POST AS</label>
                <div className="profile-inline-options">
                  <button type="button" className={`profile-inline-opt ${postAs === "designer" ? "active" : ""}`} onClick={() => setPostAs("designer")}>DESIGNER</button>
                  <button type="button" className={`profile-inline-opt ${postAs === "resaler" ? "active" : ""}`} onClick={() => setPostAs("resaler")}>RESALER</button>
                </div>
              </div>
            )}
            {totalImages() > 0 && (
              <div className="profile-field">
                <label className="profile-label">ALL PHOTOS ({totalImages()})</label>
                <div className="profile-field-note">Images are grouped by color</div>
              </div>
            )}
            <button type="submit" className="profile-submit-btn">{editingItem ? "UPDATE ITEM" : "POST ITEM"}</button>
          </form>
        </div>
      </div>
    </>
  );
}
