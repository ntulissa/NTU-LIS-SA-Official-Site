// ── 形象宣傳部 PUBLICITY ─────────────────────────────────────
// 結構完全比照 gen.tsx（行政部）。把下面的 intro／joinBlurb／services／heads／members 換成本部門的內容即可。
// 圖片命名：服務圖放 imports/services/ima1.png…；幹部照放 imports/members/ima1.png…
import { svcImg, memImg, type DeptData } from "./deptShared";

export const ima: DeptData = {
  slug: "ima", // 網址：#/dept/ima
  zh: "形象宣傳部",
  en: "IMAGE AND PUBLICITY AFFAIRS", // 英文名可自行調整
  color: "#9C4A6E",
  intro: "形象宣傳部於第 52 屆系學會由傳統的「美宣、公關、行宣」三部整併而成，專責塑造與推廣系學會的品牌形象。部門主責社群媒體營運、主視覺與各類文宣品設計、活動現場動靜態攝影，以及對外廠商與校內外單位的公關聯繫。透過跨領域資源的整合，形象宣傳部以專業視覺與精準傳播，將系學會的最新動態與優質內容傳遞給全系同學與外界。",
  joinBlurb: "加入形象宣傳部，你將親自操刀社群經營、視覺設計、活動攝影以及對外公關聯繫，全面累積品牌行銷與多媒體創作實力。這不只是發文做圖，更是用你的美感與文字定義系學會的門面與風格。一起打造最吸睛的圖資品牌，就差你一個！",
  services: [
    { name: "服務一（待補）", img: svcImg("ima1"), href: "#" },
    { name: "服務二（待補）", img: svcImg("ima2"), href: "#" },
  ],
  heads: [
    { name: "葉家米", cls: "B14", title: "部長", img: memImg("ima1") },
  ],
  members: [
    { n: "戴愷昀", c: "B14" },
    { n: "石馨予", c: "B14" },
  ],
};

export default ima;
