import "./itempage.css";
import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";
import ItemPageHorizontal from "./itempagehorizontal";

export default function ItemPage() {
  return (
    <>
      <PageHeader />
      <Breadcrumbs />
      <ItemPageHorizontal />
    </>
  );
}
