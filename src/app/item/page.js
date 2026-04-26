import "./itempage.css";
import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";
import ItemPageHorizontal from "./itempagehorizontal";
import ItemPageVertical from "./itempagevertical";

export default function ItemPage() {
  return (
    <>
      <PageHeader />
      <Breadcrumbs />
      <div className="item-page-content">
        <ItemPageVertical />
        <ItemPageHorizontal />
      </div>
    </>
  );
}
