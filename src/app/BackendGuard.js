"use client";

import { useEffect } from "react";
import { initBackendCheck } from "./backendStatus";

export default function BackendGuard() {
  useEffect(() => { initBackendCheck(); }, []);
  return null;
}
