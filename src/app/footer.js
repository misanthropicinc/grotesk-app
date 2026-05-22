import "./footer.css";
import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <a className="grotesk-footer-logo" href="/">
        <Image
          src="/imgs/grotesk-footer-logo.png"
          width={112}
          height={26}
          alt="logo"
        />
      </a>
      <div className="footer-left">
        <a href="/">HOME</a>
        <a href="/catalog">CATALOG</a>
        <a href="/cart">CART</a>
        <a href="/checkout">CHECKOUT</a>
        <a href="/order">ORDER</a>
        <a href="/auth">AUTH</a>
        <a href="/profile">PROFILE</a>
        <a href="/about">ABOUT</a>
        <a href="/item">ITEM</a>
      </div>
    </footer>
  );
}
