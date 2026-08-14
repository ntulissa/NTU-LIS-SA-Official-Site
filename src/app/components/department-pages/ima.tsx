// ── 形象宣傳部 PUBLICITY ─────────────────────────────────────
// 結構完全比照 gen.tsx（行政部）。把下面的 intro／joinBlurb／services／heads／members 換成本部門的內容即可。
// 圖片命名：服務圖放 imports/services/ima1.png…；幹部照放 imports/members/ima1.png…
import { svcImg, memImg, type DeptData } from "./deptShared";

export const ima: DeptData = {
  slug: "ima", // 網址：#/dept/ima
  zh: "形象宣傳部",
  en: "PUBLICITY", // 英文名可自行調整
  color: "#9C4A6E",
  intro: "（形象宣傳部簡介待補——寫法可參考 gen.tsx。）",
  joinBlurb: "（加入形象宣傳部的介紹文案待補。）",
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
