"use client";

import { useState, useEffect } from "react";
import "./VerticalScrollBar.css";

export default function VerticalScrollBar({ scrollRef }) {
  const [scrollRatio, setScrollRatio] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(100);
  const [trackHeight, setTrackHeight] = useState(0);

  useEffect(() => {
    if (!scrollRef?.current) return;
    const container = scrollRef.current;

    const update = () => {
      const verticalPadding = 20;
      const thumbGap = 3;
      const currentTrackHeight = container.clientHeight - verticalPadding * 2;
      const innerTrackHeight = currentTrackHeight - thumbGap * 2;
      const contentHeight = container.scrollHeight;
      const thumbH =
        (container.clientHeight / contentHeight) * innerTrackHeight;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const ratio = maxScroll > 0 ? container.scrollTop / maxScroll : 0;

      setTrackHeight(currentTrackHeight);
      setThumbHeight(thumbH);
      setScrollRatio(ratio);
    };

    update();
    container.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      container.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const maxTranslate = trackHeight - thumbHeight - 6;
  const translateY = maxTranslate * scrollRatio;

  return (
    <div
      className="vertical-scrollbar-track"
      style={{ height: trackHeight, width: 9 }}
    >
      <div
        className="vertical-scrollbar-thumb"
        style={{
          height: thumbHeight,
          transform: `translateY(${translateY}px)`,
        }}
      ></div>
    </div>
  );
}
