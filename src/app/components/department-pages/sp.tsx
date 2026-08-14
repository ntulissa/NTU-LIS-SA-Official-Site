// ── 體育部 SPORTS ───────────────────────────────────────────
// 結構完全比照 gen.tsx（行政部）。把下面的 intro／joinBlurb／services／heads／members 換成本部門的內容即可。
// 圖片命名：服務圖放 imports/services/sp1.png…；幹部照放 imports/members/sp1.png…
import { svcImg, memImg, type DeptData } from "./deptShared";

export const sp: DeptData = {
  slug: "sp", // 網址：#/dept/sp
  zh: "體育部",
  en: "SPORTS", // 英文名可自行調整
  color: "#8C7B6B",
  intro: "（體育部簡介待補——寫法可參考 gen.tsx。）",
  joinBlurb: "（加入體育部的介紹文案待補。）",
  services: [
    { name: "服務一（待補）", img: svcImg("sp1"), href: "#" },
    { name: "服務二（待補）", img: svcImg("sp2"), href: "#" },
  ],
  heads: [
    { name: "待補", cls: "B14", title: "部長", img: memImg("sp1") },
  ],
  members: [
    { n: "待補", c: "B13" },
  ],
};

export default sp;
