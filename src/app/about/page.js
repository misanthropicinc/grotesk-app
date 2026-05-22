import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";

export default function AboutPage() {
  return (
    <>
      <PageHeader />
      <Breadcrumbs />
      <div style={{ maxWidth: 800, margin: "60px auto", padding: "0 32px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, marginBottom: 20 }}>ABOUT</h1>
        <p style={{ fontSize: 12, lineHeight: 1.8, color: "#333" }}>
          GROTESK is a fashion marketplace platform.
        </p>
      </div>
    </>
  );
}
