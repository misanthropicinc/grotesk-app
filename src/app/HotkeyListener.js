"use client";

import { useEffect, useRef } from "react";
import { toggleForceLocal, isForceLocal } from "./backendStatus";
import { showNotification } from "./notify";

const USERS_KEY = "grotesk_users";
const SESSION_KEY = "grotesk_session";

function clearAllAccounts() {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(SESSION_KEY);
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("grotesk_reset_")) {
      localStorage.removeItem(key);
    }
  }
}

export default function HotkeyListener() {
  const pressedRef = useRef(new Set());

  useEffect(() => {
    function handleKeyDown(e) {
      if (!e.key) return;
      pressedRef.current.add(e.key.toLowerCase());

      if (
        pressedRef.current.has("s") &&
        pressedRef.current.has("h") &&
        pressedRef.current.has("i") &&
        pressedRef.current.has("t")
      ) {
        e.preventDefault();
        const nowLocal = toggleForceLocal();
        showNotification(
          nowLocal
            ? "OFFLINE MODE — using localStorage"
            : "ONLINE MODE — backend required",
          2000
        );
      }

      if (
        pressedRef.current.has("d") &&
        pressedRef.current.has("a") &&
        pressedRef.current.has("m") &&
        pressedRef.current.has("n")
      ) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("checkout-autofill"));
      }

      if (
        pressedRef.current.has("f") &&
        pressedRef.current.has("u") &&
        pressedRef.current.has("c") &&
        pressedRef.current.has("k")
      ) {
        e.preventDefault();
        clearAllAccounts();

        const notif = document.createElement("div");
        notif.className = "wipe-notif";
        notif.textContent = "All accounts wiped.";
        document.body.appendChild(notif);

        setTimeout(() => {
          notif.remove();
          window.location.reload();
        }, 1500);
      }
    }
    function handleKeyUp(e) {
      if (!e.key) return;
      pressedRef.current.delete(e.key.toLowerCase());
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return null;
}
