"use client";

import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 600;

    function tick() {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct);
      if (pct < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => setVisible(false), 150);
      }
    }

    requestAnimationFrame(tick);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 999999,
      background: "#101010",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 40,
      transition: "opacity 0.15s ease",
    }}>
      <img
        src="/imgs/grotesk-footer-logo.png"
        alt="GROTESK"
        style={{ width: 200, height: "auto", opacity: 0.9 }}
      />
      <div style={{
        width: 240,
        height: 3,
        background: "#333",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: "white",
          borderRadius: 2,
          transition: "width 0.05s linear",
        }} />
      </div>
    </div>
  );
}
