"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

function getItems() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("grotesk_items") || "[]");
  } catch {
    return [];
  }
}

export default function HeaderSearch({ inputClass, dropdownUp }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 0) {
      const items = getItems();
      const q = val.toLowerCase();
      const matches = items.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.brand?.toLowerCase().includes(q) ||
          i.type?.toLowerCase().includes(q)
      );
      setSuggestions(matches.slice(0, 6));
      setOpen(matches.length > 0);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery("");
    }
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  function selectItem(id) {
    router.push(`/item?id=${id}`);
    setOpen(false);
    setQuery("");
  }

  function viewAll() {
    router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        className={inputClass}
        placeholder="SEARCH..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {open && inputRef.current && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            width: inputRef.current.offsetWidth,
            left: inputRef.current.getBoundingClientRect().left,
            [dropdownUp ? "bottom" : "top"]: inputRef.current.getBoundingClientRect()[dropdownUp ? "top" : "bottom"],
            zIndex: 2147483647,
            background: "white",
            border: "1px solid #101010",
            color: "#101010",
            fontSize: 11,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {suggestions.map((item) => (
            <div
              key={item.id}
              onClick={() => selectItem(item.id)}
              style={{
                padding: "8px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <span>
                {item.title} — {item.brand}
              </span>
              <span style={{ color: "#999", fontSize: 10 }}>${item.price}</span>
            </div>
          ))}
          <div
            onClick={viewAll}
            style={{
              padding: "8px 10px",
              cursor: "pointer",
              textAlign: "center",
              fontWeight: 600,
              color: "#101010",
              fontSize: 10,
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            VIEW ALL RESULTS
          </div>
        </div>
      )}
    </>
  );
}
