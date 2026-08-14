// ── 活動部 EVENTS ───────────────────────────────────────────
// 結構完全比照 gen.tsx（行政部）。把下面的 intro／joinBlurb／services／heads／members 換成本部門的內容即可。
// 圖片命名：服務圖放 imports/services/eve1.png…；幹部照放 imports/members/eve1.png…
import { svcImg, memImg, type DeptData } from "./deptShared";

export const eve: DeptData = {
  slug: "eve", // 網址：#/dept/eve
  zh: "活動部",
  en: "EVENTS", // 英文名可自行調整
  color: "#C24A4F",
  intro: "（活動部簡介待補——寫法可參考 gen.tsx。）",
  joinBlurb: "（加入活動部的介紹文案待補。）",
  services: [
    // href 先用 "#"，之後接服務頁；找不到圖會顯示佔位框。
    { name: "服務一（待補）", img: svcImg("eve1"), href: "#" },
    { name: "服務二（待補）", img: svcImg("eve2"), href: "#" },
  ],
  heads: [
    // 幹部照放 imports/members/eve1.png…（找不到＝照片待補）。
    { name: "待補", cls: "B14", title: "部長", img: memImg("eve1") },
  ],
  members: [
    { n: "待補", c: "B13" },
  ],
};

export default eve;
