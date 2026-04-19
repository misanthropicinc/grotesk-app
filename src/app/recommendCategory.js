import "./recommendCategory.css";
import Image from "next/image";

export default function RecommendCategory() {
  return (
    <>
      <div className="recommendCat">
        <div className="recommendCatTitle">
          <p>CATEGORY</p>
        </div>
        <div className="recommendCatImg">
          <Image
            src="/imgs/sampleImgsRecommend/bombers.png"
            alt=""
            fill
            unoptimized
          />
        </div>
      </div>
    </>
  );
}
