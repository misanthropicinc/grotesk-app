import fs from "fs";
import path from "path";

export async function getHeroImages() {
  const heroDir = path.join(process.cwd(), "public/imgs/hero");
  const files = fs.readdirSync(heroDir);
  return files
    .filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file))
    .map((file) => `/imgs/hero/${file}`);
}