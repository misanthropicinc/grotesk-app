"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";
import {
  getSession,
  getCurrentUser,
  logout,
  updateUserProfile,
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
} from "./profileService";
import "./profile.css";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Mali","Mauritania","Mauritius","Mexico","Moldova","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

const GARMENT_TYPES = [
  "T-Shirt","Hoodie","Sweatshirt","Jacket","Coat","Blazer","Jeans","Trousers","Shorts","Sweatpants","Cargo Pants","Shoes","Sneakers","Boots","Dress Shoes","Sandals","Shirt","Dress Shirt","Polo Shirt","Suit","Vest","Skirt","Dress","Jumpsuit","Overalls","Hat","Cap","Beanie","Scarf","Gloves","Belt","Tie","Socks","Underwear","Swimwear","Activewear","Loungewear","Sleepwear","Parka","Puffer Jacket","Bomber Jacket","Leather Jacket","Denim Jacket","Windbreaker","Cardigan","Turtleneck","Hoodie Dress","Tracksuit",
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const SHOE_STANDARDS = ["EU", "US", "IT", "RU"];
const GENDERS = ["Male", "Female", "Unisex"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

function isShoeType(type) {
  return ["shoe", "sneaker", "boot", "sandal"].some((kw) =>
    type.toLowerCase().includes(kw)
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
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [favItems, setFavItems] = useState([]);
  const [message, setMessage] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, height: "100vh" });

  const [role, setRole] = useState("");
  const [pfpPreview, setPfpPreview] = useState(null);
  const [designerName, setDesignerName] = useState("");
  const [designerLogoPreview, setDesignerLogoPreview] = useState(null);
  const [runwayGifs, setRunwayGifs] = useState([]);
  const [saving, setSaving] = useState(false);

  const [itemTitle, setItemTitle] = useState("");
  const [itemBrand, setItemBrand] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemType, setItemType] = useState("");
  const [itemGender, setItemGender] = useState("");
  const [itemCondition, setItemCondition] = useState("");
  const [itemSize, setItemSize] = useState("");
  const [itemCustomSize, setItemCustomSize] = useState("");
  const [itemColorName, setItemColorName] = useState("");
  const [itemColorHex, setItemColorHex] = useState("#000000");
  const [itemCountry, setItemCountry] = useState("");
  const [itemShoeStandard, setItemShoeStandard] = useState("");
  const [itemImages, setItemImages] = useState([]);
  const [itemImagePreviews, setItemImagePreviews] = useState([]);
  const [itemShoeModels, setItemShoeModels] = useState([]);
  const [postAs, setPostAs] = useState("");

  const pfpInputRef = useRef(null);
  const gifInputRef = useRef(null);
  const fileInputRef = useRef(null);
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
    }
  }, []);

  const isShoe = isShoeType(itemType);
  const sizes = isShoe ? SHOE_SIZES : CLOTHING_SIZES;
  const sizeOptions = useMemo(() => [...sizes, "CUSTOM"], [sizes]);

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
    setItemTitle(""); setItemBrand(""); setItemPrice(""); setItemDescription("");
    setItemType(""); setItemGender(""); setItemCondition("");
    setItemSize(""); setItemCustomSize(""); setItemColorName(""); setItemColorHex("#000000");
    setItemCountry(""); setItemShoeStandard("");
    setItemImages([]); setItemImagePreviews([]); setItemShoeModels([]);
    setPostAs("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (shoeFileInputRef.current) shoeFileInputRef.current.value = "";
    recalcMenuPos();
    menuOpenRef.current = true;
    setAddItemOpen(true);
  }

  function closeAddItem() {
    menuOpenRef.current = false;
    setAddItemOpen(false);
  }

  async function handleItemImagesUpload(e) {
    const files = Array.from(e.target.files);
    const remaining = 10 - itemImages.length;
    if (files.length > remaining) showMessage(`Maximum 10 images. You can add ${remaining} more.`);
    for (const f of files.slice(0, remaining)) {
      const url = await convertFileToDataURL(f);
      setItemImages((prev) => [...prev, url]);
      setItemImagePreviews((prev) => [...prev, url]);
    }
  }

  function removeItemImage(index) {
    setItemImages((prev) => prev.filter((_, i) => i !== index));
    setItemImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleShoeModelUpload(e) {
    const files = Array.from(e.target.files);
    const newModels = [];
    for (const f of files) {
      newModels.push({ name: f.name, url: await convertFileToDataURL(f) });
    }
    setItemShoeModels((prev) => [...prev, ...newModels]);
  }

  function removeItemShoeModel(index) {
    setItemShoeModels((prev) => prev.filter((_, i) => i !== index));
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

    const finalSize = itemSize === "CUSTOM" ? itemCustomSize.trim() : itemSize;
    if (!finalSize) return showMessage("Size is required");
    if (!itemColorName.trim()) return showMessage("Color is required");
    if (!itemCountry) return showMessage("Seller country is required");
    if (isShoe && !itemShoeStandard) return showMessage("Shoe standard is required (EU/US/IT/RU)");

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

    addItem({
      title: itemTitle.trim(),
      brand: itemBrand.trim(),
      price: itemPrice.trim(),
      description: itemDescription.trim(),
      type: itemType,
      gender: itemGender,
      condition: itemCondition,
      size: finalSize,
      shoeStandard: isShoe ? itemShoeStandard : "",
      color: itemColorName.trim(),
      colorHex: itemColorHex,
      sellerCountry: itemCountry,
      images: itemImages,
      shoeModels: itemShoeModels,
      postedBy: session.telegram,
      postedByRole,
      postedByName,
    });

    showMessage("Item posted successfully", "success");
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
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="1.2"/><path d="M12 8h3M1 8h3M8 1v3M8 12v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
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
            <div className="profile-grid">
              {favItems.map((item) => (
                <div key={item.id} className="profile-grid-card">
                  <div className="profile-grid-card-img">
                    {item.images[0] ? <img src={item.images[0]} alt={item.title} /> : <div className="profile-grid-noimg">NO IMAGE</div>}
                  </div>
                  <div className="profile-grid-card-info">
                    <p className="profile-grid-card-title">{item.title}</p>
                    <p className="profile-grid-card-brand">{item.brand}</p>
                    <p className="profile-grid-card-price">${item.price}</p>
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
                    {item.images[0] ? <img src={item.images[0]} alt={item.title} /> : <div className="profile-grid-noimg">NO IMAGE</div>}
                  </div>
                  <div className="profile-grid-card-info">
                    <p className="profile-grid-card-title">{item.title}</p>
                    <p className="profile-grid-card-brand">{item.brand}</p>
                    <p className="profile-grid-card-price">${item.price}</p>
                    <div className="profile-grid-card-meta">
                      <span className="profile-grid-card-role">{item.postedByRole.toUpperCase()}</span>
                      {item.size && <span className="profile-grid-card-size">{item.size}</span>}
                    </div>
                    <button className="profile-item-delete" onClick={() => handleDeleteItem(item.id)}>DELETE</button>
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
            <h3>NEW ITEM</h3>
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
              <label className="profile-label">SIZE *</label>
              <SearchableSelect value={itemSize} onChange={(e) => setItemSize(e.target.value)} options={sizeOptions} placeholder="SELECT SIZE" />
              {itemSize === "CUSTOM" && (
                <input className="profile-input profile-input-sm" type="text" placeholder="Enter custom size" value={itemCustomSize} onChange={(e) => setItemCustomSize(e.target.value)} style={{ marginTop: 6 }} />
              )}
            </div>
            {isShoe && (
              <div className="profile-field">
                <label className="profile-label">SHOE STANDARD *</label>
                <SearchableSelect value={itemShoeStandard} onChange={(e) => setItemShoeStandard(e.target.value)} options={SHOE_STANDARDS} placeholder="SELECT STANDARD" />
              </div>
            )}
            <div className="profile-field">
              <label className="profile-label">COLOR *</label>
              <div className="profile-color-row">
                <input className="profile-input profile-color-picker" type="color" value={itemColorHex} onChange={(e) => setItemColorHex(e.target.value)} />
                <input className="profile-input" type="text" placeholder="Color name (e.g. Black, Off-White)" value={itemColorName} onChange={(e) => setItemColorName(e.target.value)} style={{ flex: 1 }} />
              </div>
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
                  <input ref={shoeFileInputRef} type="file" accept=".glb,.gltf" hidden multiple onChange={handleShoeModelUpload} />
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
            <div className="profile-field">
              <label className="profile-label">PHOTOS ({itemImages.length}/10)</label>
              <div className="profile-image-grid">
                {itemImagePreviews.map((prev, i) => (
                  <div key={i} className="profile-image-preview">
                    <img src={prev} alt="" />
                    <button type="button" className="profile-image-remove" onClick={() => removeItemImage(i)}>×</button>
                  </div>
                ))}
                {itemImages.length < 10 && (
                  <label className="profile-image-add">
                    <span>+</span>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden multiple onChange={handleItemImagesUpload} />
                  </label>
                )}
              </div>
            </div>
            <button type="submit" className="profile-submit-btn">POST ITEM</button>
          </form>
        </div>
      </div>
    </>
  );
}
