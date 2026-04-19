import { gotham } from "@/fonts/gotham";
import "./globals.css";
import Footer from "./footer";

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
      <body className={gotham.variable}>{children}<Footer /></body>
    </html>
  );
}
