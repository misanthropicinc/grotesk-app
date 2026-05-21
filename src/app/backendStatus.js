let _backendAvailable = null;
let _forceLocal = false;
let _checking = false;

const FORCE_LOCAL_KEY = "grotesk_force_local";

function dispatch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("backend-status-change"));
  }
}

export function initBackendCheck() {
  if (_checking) return;
  _checking = true;

  try {
    _forceLocal = localStorage.getItem(FORCE_LOCAL_KEY) === "true";
  } catch {}

  checkBackend();
}

export async function checkBackend() {
  try {
    const res = await fetch("http://localhost:8000/api/items/?limit=1", {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    _backendAvailable = res.ok;
  } catch {
    _backendAvailable = false;
  }
  dispatch();
  return _backendAvailable;
}

export function isBackendAvailable() {
  return _backendAvailable;
}

export function isForceLocal() {
  return _forceLocal;
}

export function shouldUseLocalFallback() {
  if (_forceLocal) return true;
  if (_backendAvailable === false) return true;
  return false;
}

export function toggleForceLocal() {
  _forceLocal = !_forceLocal;
  try {
    if (_forceLocal) {
      localStorage.setItem(FORCE_LOCAL_KEY, "true");
    } else {
      localStorage.removeItem(FORCE_LOCAL_KEY);
      checkBackend();
    }
  } catch {}
  dispatch();
  return _forceLocal;
}
