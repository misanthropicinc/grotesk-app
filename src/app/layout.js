import { gotham } from "@/fonts/gotham";
import "./globals.css";
import Footer from "./footer";
import HotkeyListener from "./HotkeyListener";
import BackendGuard from "./BackendGuard";

const metadata = {
  title: "GROTESK | OFFICIAL WEBSITE",
  description: "GROTESK | OFFICIAL WEBSITE",
};

export { metadata };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>GROTESK | OFFICIAL WEBSITE</title>
      </head>
      <body className={gotham.variable}>
        <BackendGuard />
        <HotkeyListener />
        {children}
        <Footer />
      </body>
    </html>
  );
}
