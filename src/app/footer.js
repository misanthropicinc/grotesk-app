import "./footer.css";
import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <a className="grotesk-footer-logo">
        <Image
          src="/imgs/grotesk-footer-logo.png"
          width={134}
          height={36}
          alt="logo"
        />
      </a>
      <div className="footer-left"></div>
    </footer>
  );
}
