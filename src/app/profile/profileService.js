import { apiGet, apiPost } from "../backend";
import { shouldUseLocalFallback } from "../backendStatus";

const ITEMS_KEY = "grotesk_items";
const FAVORITES_KEY = "grotesk_favorites";

function getItems() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function addItem(item) {
  const items = getItems();
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...item,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveItems(items);

  if (!shouldUseLocalFallback()) {
    const fd = new FormData();
    Object.entries(newItem).forEach(([k, v]) => {
      if (k !== "colors" && k !== "shoeModels" && v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });
    if (newItem.colors?.length) {
      const colorsPayload = newItem.colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        imageCount: c.images?.length || 0,
      }));
      fd.append("colors", JSON.stringify(colorsPayload));
      newItem.colors.forEach((c) => {
        (c.images || []).forEach((url) => {
          const blob = dataURLtoBlob(url);
          if (blob) fd.append("images", new File([blob], `img.webp`, { type: blob.type }));
        });
      });
    }
    fetch("http://localhost:8000/api/items/", { method: "POST", body: fd }).catch(() => {});
  }

  return newItem;
}

export function getUserItems(telegram) {
  return getItems().filter((i) => i.postedBy === telegram);
}

export async function getUserItemsFromApi(telegram) {
  const local = getUserItems(telegram);
  try {
    const data = await apiGet(`/items/?telegram=${telegram}`);
    if (data && data.length) return data;
  } catch {}
  return local;
}

export function getItemById(itemId) {
  return getItems().find((i) => i.id === itemId) || null;
}

export function updateItem(itemId, updates) {
  const items = getItems();
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  saveItems(items);
  if (!shouldUseLocalFallback()) {
    const fd = new FormData();
    const updated = items[idx];
    Object.entries(updated).forEach(([k, v]) => {
      if (k !== "colors" && k !== "shoeModels" && v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });
    if (updated.colors?.length) {
      const colorsPayload = updated.colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        imageCount: c.images?.length || 0,
      }));
      fd.append("colors", JSON.stringify(colorsPayload));
      updated.colors.forEach((c) => {
        (c.images || []).forEach((url) => {
          const blob = dataURLtoBlob(url);
          if (blob) fd.append("images", new File([blob], `img.webp`, { type: blob.type }));
        });
      });
    }
    fetch(`http://localhost:8000/api/items/${itemId}/`, { method: "PATCH", body: fd }).catch(() => {});
  }
  return items[idx];
}

export function seedDefaultItem() {
  const items = getItems();
  if (items.some((i) => i.id === "admin_hoodie_placeholder")) return;
  const newItem = {
    id: "admin_hoodie_placeholder",
    title: "OVERSIZED HOODIE",
    brand: "DRKSHDW",
    price: "600",
    description: "DRKSHDW SS26 TEMPLE OVERSIZED HOODIE IN BLACK/MILK FURKA HEAVY SWEATSHIRT JERSEY. HIP-LENGTH, LOOSE FIT, LONG SLEEVES. HOOD WITH DRAWSTRING, RIBBED CUFFS AND WAISTBAND. SIGNATURE LEVEL SHOULDER SEAMS. HEAVYWEIGHT GOTS CERTIFIED ORGANIC COTTON.",
    collection: "ss26 temple",
    type: "Hoodie",
    gender: "Male",
    condition: "New",
    size: "S, M, L, XL",
    sellerCountry: "United States",
    postedBy: "admin",
    postedByRole: "superuser",
    postedByName: "ADMIN",
    thumbnailIndex: 0,
    colors: [
      {
        name: "Black/Milk",
        hex: "#000000",
        images: [
          "/imgs/presetitemimg1.webp",
          "/imgs/presetitemimg2.webp",
          "/imgs/presetitemimg3.webp",
          "/imgs/presetitemimg4.webp",
          "/imgs/presetitemimg5.webp",
          "/imgs/presetitemimg6.webp",
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveItems(items);
}

export function deleteItem(itemId) {
  const items = getItems().filter((i) => i.id !== itemId);
  saveItems(items);
  if (!shouldUseLocalFallback()) {
    fetch(`http://localhost:8000/api/items/${itemId}/`, { method: "DELETE" }).catch(() => {});
  }
}

export function getAllItems() {
  return getItems();
}

export function convertFileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getFavorites(telegram) {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(FAVORITES_KEY + "_" + telegram);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addFavorite(telegram, itemId) {
  const favs = getFavorites(telegram);
  if (!favs.includes(itemId)) {
    favs.push(itemId);
    localStorage.setItem(FAVORITES_KEY + "_" + telegram, JSON.stringify(favs));
  }
  if (!shouldUseLocalFallback()) {
    apiPost("/items/favorites/", { telegram, item_id: String(itemId) }).catch(() => {});
  }
}

export function removeFavorite(telegram, itemId) {
  const favs = getFavorites(telegram).filter((id) => id !== itemId);
  localStorage.setItem(FAVORITES_KEY + "_" + telegram, JSON.stringify(favs));
  if (!shouldUseLocalFallback()) {
    fetch(`http://localhost:8000/api/items/favorites/?telegram=${telegram}&item_id=${itemId}`, {
      method: "DELETE",
    }).catch(() => {});
  }
}

export function getFavoriteItems(telegram) {
  const favIds = getFavorites(telegram);
  return getItems().filter((i) => favIds.includes(i.id));
}

function dataURLtoBlob(url) {
  if (!url || !url.startsWith("data:")) return null;
  const [meta, b64] = url.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "application/octet-stream";
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new Blob([buf], { type: mime });
}
