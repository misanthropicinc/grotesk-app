const API = "http://localhost:8000/api";

async function api(method, path, body, isFormData = false) {
  try {
    const opts = { method };
    if (body) {
      if (isFormData) {
        opts.body = body;
      } else {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify(body);
      }
    }
    const res = await fetch(`${API}${path}`, opts);
    if (!res.ok) return null;
    if (res.status === 204) return { success: true };
    return await res.json();
  } catch {
    return null;
  }
}

export function apiGet(path) {
  return api("GET", path);
}

export function apiPost(path, body) {
  return api("POST", path, body);
}

export function apiPatch(path, body) {
  return api("PATCH", path, body);
}

export function apiFormPost(path, fd) {
  return api("POST", path, fd, true);
}

export function apiFormPatch(path, fd) {
  return api("PATCH", path, fd, true);
}

export default api;
