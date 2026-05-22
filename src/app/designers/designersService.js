import { getAllUsers, updateUserProfile } from "../auth/authService";

export function getDesigners() {
  return getAllUsers()
    .filter((u) => u.role === "designer" && u.designerProfile?.name?.trim())
    .map((u) => ({
      telegram: u.telegram,
      name: u.designerProfile.name,
      logo: u.designerProfile.logo || "",
      genre: u.designerProfile.genre || "",
    }));
}

export function updateDesignerGenre(telegram, genre) {
  const user = getAllUsers().find((u) => u.telegram === telegram);
  if (!user) return;
  const existing = user.designerProfile || {};
  updateUserProfile(telegram, {
    designerProfile: { ...existing, genre: genre.trim() },
  });
}
