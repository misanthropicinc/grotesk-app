import { gotham } from "@/fonts/gotham";
import "./globals.css";

export const metadata = {
  title: "GROTESK | OFFICIAL WEBSITE",
  description: "GROTESK | OFFICIAL WEBSITE",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>GROTESK | OFFICIAL WEBSITE</title>
      </head>
      <body className={gotham.variable}>{children}</body>
    </html>
  );
}
