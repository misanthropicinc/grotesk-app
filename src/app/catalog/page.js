"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import SearchBarComponent from "../SearchBarComponent";
import ItemCard from "./itemCard";
import "./page.css";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Mali", "Mauritania", "Mauritius", "Mexico", "Moldova", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const shoeSizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const genders = ["Male", "Female", "Unisex"];
const conditions = ["New", "Like New", "Good", "Fair", "Poor"];
const garmentTypes = ["T-Shirt", "Hoodie", "Sweatshirt", "Jacket", "Coat", "Blazer", "Jeans", "Trousers", "Shorts", "Sweatpants", "Cargo Pants", "Shoes", "Sneakers", "Boots", "Dress Shoes", "Sandals", "Shirt", "Dress Shirt", "Polo Shirt", "Suit", "Vest", "Skirt", "Dress", "Jumpsuit", "Overalls", "Hat", "Cap", "Beanie", "Scarf", "Gloves", "Belt", "Tie", "Socks", "Underwear", "Swimwear", "Activewear", "Loungewear", "Sleepwear", "Parka", "Puffer Jacket", "Bomber Jacket", "Leather Jacket", "Denim Jacket", "Windbreaker", "Cardigan", "Turtleneck", "Hoodie Dress", "Tracksuit"];

const DEFAULT_ITEMS = [
  {
    id: "admin_hoodie_placeholder",
    title: "OVERSIZED HOODIE",
    brand: "DRKSHDW",
    price: "600",
    type: "Hoodie",
    gender: "Male",
    condition: "New",
    size: "M",
    color: "BLACK/MILK",
    sellerCountry: "United States",
    image: "/imgs/presetitemimg1.webp",
  },
];

function FilterInput({ placeholder, list, value, onChange }) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = list.filter(item =>
    item.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="filter-input-wrapper" style={{ position: "relative" }}>
      <input
        className="filter-input"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsFocused(true);
          if (onChange) onChange(e.target.value || "");
        }}
        onFocus={() => setIsFocused(true)}
        autoComplete="off"
      />
      {isFocused && filtered.length > 0 && (
        <div className="filter-dropdown">
          {filtered.map((item) => (
            <div
              key={item}
              className="filter-dropdown-item"
              onMouseDown={(e) => {
                e.preventDefault();
                setInputValue(item);
                setIsFocused(false);
                if (onChange) onChange(item);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getLocalItems() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("grotesk_items") || "[]");
  } catch {
    return [];
  }
}

export default function Catalog() {
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, height: "100vh" });
  const [searchText, setSearchText] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterPriceFrom, setFilterPriceFrom] = useState("");
  const [filterPriceTo, setFilterPriceTo] = useState("");
  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    const gender = searchParams.get("gender");
    const type = searchParams.get("type");
    const designer = searchParams.get("designer");
    const q = searchParams.get("q");
    if (gender) setFilterGender(gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase());
    if (type) {
      const formatted = type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      setFilterType(formatted);
    }
    if (designer) setFilterBrand(designer);
    if (q) setSearchText(q);
    setLocalItems(getLocalItems());
  }, []);

  const isShoes = filterType.toLowerCase().includes("shoe");

  const allItems = useMemo(() => {
    const defaultIds = new Set(DEFAULT_ITEMS.map((d) => d.id).filter(Boolean));
    const merged = [...DEFAULT_ITEMS];
    for (const i of localItems) {
      if (!defaultIds.has(i.id)) {
        merged.push({
          id: i.id,
          title: i.title,
          brand: i.brand,
          price: i.price,
          type: i.type,
          gender: i.gender,
          condition: i.condition,
          size: i.size,
          color: i.color || i.colors?.[0]?.name || "",
          sellerCountry: i.sellerCountry,
          image: i.colors?.[0]?.images?.[0] || i.images?.[0] || "",
        });
      }
    }
    return merged;
  }, [localItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const s = searchText.toLowerCase();
      if (s && !item.title?.toLowerCase().includes(s) && !item.brand?.toLowerCase().includes(s) && !item.type?.toLowerCase().includes(s))
        return false;
      if (filterCountry && item.sellerCountry !== filterCountry) return false;
      if (filterSize && item.size !== filterSize) return false;
      if (filterType && item.type !== filterType) return false;
      if (filterBrand && !item.brand?.toLowerCase().includes(filterBrand.toLowerCase())) return false;
      if (filterGender && item.gender !== filterGender) return false;
      if (filterCondition && item.condition !== filterCondition) return false;
      const price = parseFloat(item.price);
      if (filterPriceFrom && price < parseFloat(filterPriceFrom)) return false;
      if (filterPriceTo && price > parseFloat(filterPriceTo)) return false;
      return true;
    });
  }, [allItems, searchText, filterCountry, filterSize, filterType, filterBrand, filterGender, filterCondition, filterPriceFrom, filterPriceTo, localItems]);

  useEffect(() => {
    const update = () => {
      const header = document.querySelector(".catalog-top-section");
      const searchSection = document.querySelector(".catalog-seciton");
      let top = 0;
      if (header) top += header.getBoundingClientRect().height;
      if (searchSection) top += searchSection.getBoundingClientRect().height;
      setMenuStyle({ top, height: `calc(100vh - ${top}px)` });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isFilterOpen]);

  useEffect(() => {
    if (isFilterOpen) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollTop}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollTop = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollTop) window.scrollTo(0, -parseInt(scrollTop));
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isFilterOpen]);

  function clearFilters() {
    setFilterCountry("");
    setFilterSize("");
    setFilterType("");
    setFilterBrand("");
    setFilterGender("");
    setFilterCondition("");
    setFilterPriceFrom("");
    setFilterPriceTo("");
    setSearchText("");
  }

  return (
    <>
      <div style={{ position: "relative", zIndex: isFilterOpen ? 1 : "auto" }}>
        <section className="catalog-seciton">
          <div className="catalog-searchfilter">
            <SearchBarComponent
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button
              className="filter-button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              FILTER
              <img src="/Vector.svg" alt="filter" />
            </button>
          </div>
        </section>
      </div>

      <div
        className={`filter-overlay ${isFilterOpen ? "visible" : ""}`}
        style={{ top: `${menuStyle.top}px`, height: menuStyle.height }}
        onClick={() => setIsFilterOpen(false)}
      />
      <div
        className={`filter-menu ${isFilterOpen ? "open" : ""}`}
        style={menuStyle}
      >
        <div className="filter-menu-inner">
          <h3>FILTER OPTIONS</h3>
          <FilterInput placeholder="SELLER COUNTRY" list={countries} value={filterCountry} onChange={setFilterCountry} />
          <FilterInput placeholder="SIZE" list={isShoes ? shoeSizes : clothingSizes} value={filterSize} onChange={setFilterSize} />
          <FilterInput placeholder="TYPE OF GARMENT" list={garmentTypes} value={filterType} onChange={(v) => setFilterType(v)} />
          <FilterInput placeholder="BRAND" list={[]} value={filterBrand} onChange={setFilterBrand} />
          <FilterInput placeholder="GENDER" list={genders} value={filterGender} onChange={setFilterGender} />
          <FilterInput placeholder="CONDITION" list={conditions} value={filterCondition} onChange={setFilterCondition} />
          <div style={{ marginBottom: "30px" }} />
          <div style={{ fontSize: "18px", marginBottom: "10px", marginTop: "20px" }}>PRICE RANGE</div>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "15px" }}>
            <input
              className="filter-input"
              placeholder="PRICE FROM"
              value={filterPriceFrom}
              onChange={(e) => setFilterPriceFrom(e.target.value)}
              style={{ width: "50%", background: "none", cursor: "text" }}
            />
            <input
              className="filter-input"
              placeholder="PRICE TO"
              value={filterPriceTo}
              onChange={(e) => setFilterPriceTo(e.target.value)}
              style={{ width: "50%", background: "none", cursor: "text" }}
            />
          </div>
          <button
            onClick={clearFilters}
            style={{ width: "100%", padding: "10px", border: "1px solid #101010", background: "white", cursor: "pointer", fontSize: "11px", textTransform: "uppercase", fontFamily: "inherit" }}
          >
            CLEAR FILTERS
          </button>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: isFilterOpen ? 1 : "auto" }}>
        <div className="catalog-grid-container">
          {filteredItems.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", fontSize: "12px", color: "#666", border: "1px solid #999" }}>
              NO ITEMS MATCH YOUR SEARCH
            </div>
          ) : (
            filteredItems.map((item, i) => (
              <ItemCard
                key={item.id || i}
                id={item.id}
                title={item.title}
                brand={item.brand}
                price={item.price}
                image={item.image}
                collection={item.collection}
                postedByRole={item.postedByRole}
                postedByName={item.postedByName}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
