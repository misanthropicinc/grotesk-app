import "./footer.css";
import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <a className="grotesk-footer-logo">
        <Image
          src="/imgs/grotesk-footer-logo.png"
          width={112}
          height={26}
          alt="logo"
        />
      </a>
      <div className="footer-left">
        <a href="/home">HOME</a>
        <a href="/catalog">CATALOG</a>
        <a href="#">AUTH</a>
        <a href="#">PROFILE</a>
        <a href="#">ORDER</a>
        <a href="/item">ITEM PAGE</a>
      </div>
    </footer>
  );
}
