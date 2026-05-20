import { apiGet, apiFormPatch } from "../backend";

const USERS_KEY = "grotesk_users";
const SESSION_KEY = "grotesk_session";
const RESET_PREFIX = "grotesk_reset_";

function getUsers() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeTelegram(username) {
  return username.replace(/^@/, "").toLowerCase().trim();
}

export async function scanChatId(telegram) {
  const tg = normalizeTelegram(telegram);
  if (!tg) return { success: false, error: "Telegram username is required" };

  try {
    const resp = await fetch("/api/auth/scan-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegram: tg }),
    });
    return await resp.json();
  } catch {
    return { success: false, error: "Could not reach server. Try again." };
  }
}

export function completeRegistration(telegram, password, chatId) {
  const tg = normalizeTelegram(telegram);
  if (!tg) return { success: false, error: "Telegram username is required" };
  if (!password || password.length < 6)
    return { success: false, error: "Password must be at least 6 characters" };
  if (!chatId) return { success: false, error: "Chat ID is required. Message the bot first." };

  const users = getUsers();
  if (users.find((u) => u.telegram === tg))
    return { success: false, error: "This Telegram account is already registered" };

  users.push({ telegram: tg, password, chatId });
  saveUsers(users);
  return { success: true };
}

export function login(telegram, password) {
  const tg = normalizeTelegram(telegram);
  if (!tg) return { success: false, error: "Telegram username is required" };
  if (!password) return { success: false, error: "Password is required" };

  const users = getUsers();
  const user = users.find((u) => u.telegram === tg);
  if (!user) return { success: false, error: "Account not found" };
  if (user.password !== password) return { success: false, error: "Incorrect password" };

  localStorage.setItem(SESSION_KEY, JSON.stringify({ telegram: tg }));
  return { success: true };
}

export function requestResetCode(telegram) {
  const tg = normalizeTelegram(telegram);
  if (!tg) return { success: false, error: "Telegram username is required" };

  const users = getUsers();
  const user = users.find((u) => u.telegram === tg);
  if (!user) return { success: false, error: "Account not found" };

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 32; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  localStorage.setItem(RESET_PREFIX + tg, JSON.stringify({ code, expires: Date.now() + 900000 }));

  return { success: true, code, telegram: tg, chatId: user.chatId };
}

export function verifyResetCode(telegram, code) {
  const tg = normalizeTelegram(telegram);
  if (!tg) return { success: false, error: "Telegram username is required" };

  try {
    const stored = JSON.parse(localStorage.getItem(RESET_PREFIX + tg));
    if (!stored) return { success: false, error: "No reset code found. Request a new one." };
    if (Date.now() > stored.expires) {
      localStorage.removeItem(RESET_PREFIX + tg);
      return { success: false, error: "Reset code expired. Request a new one." };
    }
    if (stored.code !== code) return { success: false, error: "Incorrect verification code." };

    return { success: true };
  } catch {
    return { success: false, error: "Verification failed." };
  }
}

export function resetPassword(telegram, code, newPassword) {
  if (!newPassword || newPassword.length < 6)
    return { success: false, error: "Password must be at least 6 characters" };

  const verified = verifyResetCode(telegram, code);
  if (!verified.success) return verified;

  const tg = normalizeTelegram(telegram);
  const users = getUsers();
  const user = users.find((u) => u.telegram === tg);
  if (!user) return { success: false, error: "Account not found" };

  user.password = newPassword;
  saveUsers(users);
  localStorage.removeItem(RESET_PREFIX + tg);
  return { success: true };
}

export async function sendTelegramMessage(chatId, text) {
  try {
    const resp = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, text }),
    });
    return await resp.json();
  } catch {
    return { success: false, error: "Could not reach server. Try again." };
  }
}

export function clearAllAccounts() {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(SESSION_KEY);
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(RESET_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/** Sync localStorage user lookup (always works, no API dependency). */
export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find((u) => u.telegram === session.telegram) || null;
}

/** Async: fetch user profile from the Django API. Falls back to localStorage. */
export async function getCurrentUserFromApi() {
  const session = getSession();
  if (!session) return null;
  try {
    const data = await apiGet(`/users/${session.telegram}/`);
    if (data) {
      return {
        telegram: data.telegram,
        role: data.role,
        pfp: data.pfp || null,
        designerProfile: data.designer_name
          ? { name: data.designer_name, logo: data.designer_logo || null, runwayGifs: data.runway_gifs || [] }
          : null,
      };
    }
  } catch {}
  return getCurrentUser();
}

/** Sync localStorage profile update. */
export function updateUserProfile(telegram, updates) {
  const tg = normalizeTelegram(telegram);
  const users = getUsers();
  const idx = users.findIndex((u) => u.telegram === tg);
  if (idx === -1) return { success: false, error: "User not found" };
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return { success: true };
}

/** Async: save profile to Django API + localStorage. */
export async function updateUserProfileToApi(telegram, updates) {
  const tg = normalizeTelegram(telegram);
  const local = updateUserProfile(tg, updates);
  try {
    const fd = new FormData();
    if (updates.role !== undefined) fd.append("role", updates.role);
    if (updates.designerProfile?.name) fd.append("designer_name", updates.designerProfile.name);
    const res = await fetch(`http://localhost:8000/api/users/${tg}/`, { method: "PATCH", body: fd });
    if (res.ok) return { success: true, api: true };
  } catch {}
  return local;
}

export function getAllUsers() {
  return getUsers();
}
