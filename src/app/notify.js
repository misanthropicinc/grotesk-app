export function showNotification(text, duration = 1500) {
  const notif = document.createElement("div");
  notif.className = "wipe-notif";
  notif.textContent = text;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), duration);
}
