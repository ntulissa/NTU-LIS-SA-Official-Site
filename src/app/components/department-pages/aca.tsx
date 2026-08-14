// ── 學術部 ACADEMICS ────────────────────────────────────────
// 結構完全比照 gen.tsx（行政部）。把下面的 intro／joinBlurb／services／heads／members 換成本部門的內容即可。
// 圖片命名：服務圖放 imports/services/aca1.png…；幹部照放 imports/members/aca1.png…
import { svcImg, memImg, type DeptData } from "./deptShared";

export const aca: DeptData = {
  slug: "aca", // 網址：#/dept/aca
  zh: "學術部",
  en: "ACADEMICS", // 英文名可自行調整
  color: "#5E8C3C",
  intro: "（學術部簡介待補——寫法可參考 gen.tsx。）",
  joinBlurb: "（加入學術部的介紹文案待補。）",
  services: [
    { name: "服務一（待補）", img: svcImg("aca1"), href: "#" },
    { name: "服務二（待補）", img: svcImg("aca2"), href: "#" },
  ],
  heads: [
    { name: "周家禾", cls: "B14", title: "部長", img: memImg("aca1") },
  ],
  members: [
    { n: "許瑞米", c: "B14" },
    { n: "郭庭妤", c: "B14" },
    { n: "陳明鈺", c: "B14" },
  ],
};

export default aca;
