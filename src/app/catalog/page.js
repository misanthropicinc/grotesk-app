import SearchBar from "../SearchBar";
import SearchBarComponent from "../SearchBarComponent";
import ItemCard from "./itemCard";
import "./page.css";

export default function Catalog() {
  return (
    <>
      <section className="catalog-seciton">
        <div className="catalog-searchfilter">
          <SearchBarComponent />
        </div>
        <div className="catalog-grid-container">
          <ItemCard />
        </div>
      </section>
    </>
  );
}
