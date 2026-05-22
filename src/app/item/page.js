"use client";

import "./itempage.css";
import PageHeader from "../mainPage/PageHeader";
import Breadcrumbs from "../breadcrumbs";
import ItemPageHorizontal from "./itempagehorizontal";
import { useSearchParams } from "next/navigation";

export default function ItemPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  return (
    <>
      <PageHeader />
      <Breadcrumbs />
      <div className="item-page-content">
        <ItemPageHorizontal id={id} />
      </div>
    </>
  );
}
