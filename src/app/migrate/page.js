"use client";

import { useState, useEffect } from "react";
import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";
import { shouldUseLocalFallback } from "../backendStatus";
import "./migrate.css";

const API = "http://localhost:8000/api";

function dataURLtoBlob(url) {
  if (!url || !url.startsWith("data:")) return null;
  const [meta, b64] = url.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "application/octet-stream";
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

function blobToFile(blob, name) {
  if (!blob) return null;
  return new File([blob], name, { type: blob.type });
}

export default function MigratePage() {
  const [summary, setSummary] = useState(null);
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function addLog(msg, type = "info") {
    setLog((prev) => [...prev, { msg, type, ts: new Date().toLocaleTimeString() }]);
  }

  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem("grotesk_users") || "[]");
      const items = JSON.parse(localStorage.getItem("grotesk_items") || "[]");
      const favKeys = Object.keys(localStorage).filter((k) => k.startsWith("grotesk_favorites_"));
      const favs = favKeys.flatMap((k) => {
        const tg = k.replace("grotesk_favorites_", "");
        return (JSON.parse(localStorage.getItem(k) || "[]")).map((id) => ({ telegram: tg, itemId: id }));
      });
      setSummary({ users, items, favs });
    } catch {
      setSummary({ users: [], items: [], favs: [] });
    }
  }, []);

  async function migrate() {
    if (!summary || running) return;
    setRunning(true);
    setLog([]);
    addLog("Starting migration...", "info");

    const itemIdMap = {};


    for (const u of summary.users) {
      try {
        addLog(`Creating user @${u.telegram}...`, "info");
        const res = await fetch(`${API}/users/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telegram: u.telegram }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        addLog(`User @${u.telegram} created`, "success");


        const fd = new FormData();
        if (u.role) fd.append("role", u.role);
        if (u.designerProfile?.name) fd.append("designer_name", u.designerProfile.name);

        if (u.pfp) {
          const blob = dataURLtoBlob(u.pfp);
          const file = blobToFile(blob, "pfp.webp");
          if (file) fd.append("pfp", file);
        }

        if (u.designerProfile?.logo) {
          const blob = dataURLtoBlob(u.designerProfile.logo);
          const file = blobToFile(blob, "logo.webp");
          if (file) fd.append("designer_logo", file);
        }


        if (u.designerProfile?.runwayGifs?.length) {
          const runFd = new FormData();
          for (let i = 0; i < u.designerProfile.runwayGifs.length; i++) {
            const gifUrl = u.designerProfile.runwayGifs[i];
            const blob = dataURLtoBlob(gifUrl);
            if (blob) {
              const isGif = blob.type === "image/gif";
              runFd.append("files", blobToFile(blob, `runway_${i}.${isGif ? "gif" : "mp4"}`));
            }
          }
          if (runFd.has("files")) {
            try {
              await fetch(`${API}/users/${u.telegram}/runway/`, { method: "POST", body: runFd });
              addLog(`Runway GIFs uploaded for @${u.telegram}`, "success");
            } catch {
              addLog(`Runway upload failed for @${u.telegram}`, "error");
            }
          }
        }

        const patchRes = await fetch(`${API}/users/${u.telegram}/`, {
          method: "PATCH",
          body: fd,
        });
        if (patchRes.ok) {
          addLog(`Profile updated for @${u.telegram}`, "success");
        } else {
          addLog(`Profile update failed for @${u.telegram}`, "error");
        }
      } catch (err) {
        addLog(`User @${u.telegram} error: ${err.message}`, "error");
      }
    }


    for (const item of summary.items) {
      try {
        addLog(`Creating item "${item.title}"...`, "info");
        const fd = new FormData();
        fd.append("title", item.title || "");
        fd.append("brand", item.brand || "");
        fd.append("price", String(item.price || 0));
        fd.append("description", item.description || "");
        fd.append("type", item.type || "");
        fd.append("gender", item.gender || "");
        fd.append("condition", item.condition || "");
        fd.append("size", item.size || "");
        fd.append("custom_size", item.customSize || "");
        fd.append("shoe_standard", item.shoeStandard || "");
        fd.append("color_name", item.colorName || "");
        fd.append("color_hex", item.colorHex || "#000000");
        fd.append("country", item.country || "");
        fd.append("seller_telegram", item.sellerTelegram || "");
        fd.append("is_resale", String(!!item.isResale));
        fd.append("designer_telegram", item.designerTelegram || "");


        if (item.images?.length) {
          for (let i = 0; i < item.images.length; i++) {
            const blob = dataURLtoBlob(item.images[i]);
            const file = blobToFile(blob, `img_${i}.webp`);
            if (file) fd.append("images", file);
          }
        }


        if (item.shoeModels?.length) {
          for (const m of item.shoeModels) {
            const blob = dataURLtoBlob(m.url);
            const file = blobToFile(blob, m.name || `model_${Date.now()}.glb`);
            if (file) fd.append("shoe_models", file);
          }
        }

        const res = await fetch(`${API}/items/`, { method: "POST", body: fd });
        if (res.ok) {
          const created = await res.json();
          itemIdMap[item.id] = created.id;
          addLog(`Item "${item.title}" → ID ${created.id}`, "success");
        } else {
          const errText = await res.text();
          addLog(`Item "${item.title}" failed: ${errText}`, "error");
        }
      } catch (err) {
        addLog(`Item "${item.title}" error: ${err.message}`, "error");
      }
    }


    let favCount = 0;
    for (const fav of summary.favs) {
      const newItemId = itemIdMap[fav.itemId];
      if (!newItemId) {
        addLog(`Favorite skipped: old item ${fav.itemId} not found`, "error");
        continue;
      }
      try {
        const res = await fetch(`${API}/items/favorites/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telegram: fav.telegram, item_id: newItemId }),
        });
        if (res.ok) {
          favCount++;
        } else {
          addLog(`Favorite failed: @${fav.telegram} → item ${newItemId}`, "error");
        }
      } catch {
        addLog(`Favorite error: @${fav.telegram} → item ${newItemId}`, "error");
      }
    }
    if (favCount) addLog(`${favCount} favorites migrated`, "success");

    addLog("Migration complete!", "success");
    setDone(true);
    setRunning(false);
  }

  const backendDown = shouldUseLocalFallback();

  return (
    <>
      <PageHeader />
      <Breadcrumbs />
      <div className="migrate-page">
        <h1>Data Migration</h1>
        <p style={{ fontSize: 12, marginBottom: 20, color: "#666" }}>
          Exports localStorage → Django backend at {API}
        </p>

        {summary && (
          <div className="migrate-summary">
            <h2>localStorage Data Found</h2>
            <p>Users: {summary.users.length}</p>
            <p>Items: {summary.items.length}</p>
            <p>Favorites: {summary.favs.length}</p>
          </div>
        )}

        <button className="migrate-btn" onClick={migrate} disabled={running || done || !summary || backendDown}>
          {backendDown ? "BACKEND UNAVAILABLE" : done ? "MIGRATED" : running ? "MIGRATING..." : "START MIGRATION"}
        </button>

        {log.length > 0 && (
          <div className="migrate-log">
            {log.map((entry, i) => (
              <div key={i} className={`migrate-log-entry ${entry.type}`}>
                [{entry.ts}] {entry.msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
