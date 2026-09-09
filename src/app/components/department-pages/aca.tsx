// ── 學術部 ACADEMICS ────────────────────────────────────────
// 結構完全比照 gen.tsx（行政部）。把下面的 intro／joinBlurb／services／heads／members 換成本部門的內容即可。
// 圖片命名：服務圖放 imports/services/aca1.png…；幹部照放 imports/members/aca1.png…
import { svcImg, memImg, type DeptData } from "./deptShared";

export const aca: DeptData = {
  slug: "aca", // 網址：#/dept/aca
  zh: "學術部",
  en: "ACADEMIC AFFAIRS", // 英文名可自行調整
  color: "#5E8C3C",
  intro: "學術部專注於圖資系學術資源的整合與知識傳播，主責選課指南彙整、學術與系友職涯講座舉辦、杜鵑花節展覽策劃以及系刊採訪編寫等核心業務。透過系統化的內容產出與經驗傳承，學術部致力於幫助系上同學釐清學習方向、探索未來職涯，同時對外展現圖資領域的專業價值。",
  joinBlurb: "加入學術部，你將親自參與選課指引整理、系友講座籌辦、杜鵑花節展出與系刊採訪編輯，掌握從內容企劃到知識傳播的全套實戰力。這不只是整理資源，更是為大家指引學習與職涯方向的重要推手。與我們一起定義圖資人的專業，就差你一個！",
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
