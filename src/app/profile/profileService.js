import { apiGet, apiPost } from "../backend";

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

/** Sync localStorage add (always works). */
export function addItem(item) {
  const items = getItems();
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...item,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveItems(items);

  // Fire-and-forget: try API
  const fd = new FormData();
  Object.entries(newItem).forEach(([k, v]) => {
    if (k !== "images" && k !== "shoeModels" && v !== undefined && v !== null) {
      fd.append(k, String(v));
    }
  });
  if (newItem.images?.length) {
    newItem.images.forEach((url, i) => {
      const blob = dataURLtoBlob(url);
      if (blob) fd.append("images", new File([blob], `img_${i}.webp`, { type: blob.type }));
    });
  }
  fetch("http://localhost:8000/api/items/", { method: "POST", body: fd }).catch(() => {});

  return newItem;
}

export function getUserItems(telegram) {
  return getItems().filter((i) => i.postedBy === telegram);
}

/** Async: fetch user items from API + localStorage. */
export async function getUserItemsFromApi(telegram) {
  const local = getUserItems(telegram);
  try {
    const data = await apiGet(`/items/?telegram=${telegram}`);
    if (data && data.length) return data;
  } catch {}
  return local;
}

export function deleteItem(itemId) {
  const items = getItems().filter((i) => i.id !== itemId);
  saveItems(items);
  fetch(`http://localhost:8000/api/items/${itemId}/`, { method: "DELETE" }).catch(() => {});
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
  apiPost("/items/favorites/", { telegram, item_id: String(itemId) }).catch(() => {});
}

export function removeFavorite(telegram, itemId) {
  const favs = getFavorites(telegram).filter((id) => id !== itemId);
  localStorage.setItem(FAVORITES_KEY + "_" + telegram, JSON.stringify(favs));
  fetch(`http://localhost:8000/api/items/favorites/?telegram=${telegram}&item_id=${itemId}`, {
    method: "DELETE",
  }).catch(() => {});
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
