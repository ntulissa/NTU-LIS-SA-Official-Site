// ── 活動部 EVENTS ───────────────────────────────────────────
// 結構完全比照 gen.tsx（行政部）。把下面的 intro／joinBlurb／services／heads／members 換成本部門的內容即可。
// 圖片命名：服務圖放 imports/services/eve1.png…；幹部照放 imports/members/eve1.png…
import { svcImg, memImg, type DeptData } from "./deptShared";

export const eve: DeptData = {
  slug: "eve", // 網址：#/dept/eve
  zh: "活動部",
  en: "EVENTS AFFAIRS", // 英文名可自行調整
  color: "#C24A4F",
  intro: "活動部主責系內外各項大中型活動的策劃與執行，並持續推動現有活動的優化與創新活動的開拓。從活動發想、流程設計、場地物資調度到對外拉贊助與廠商洽談，活動部致力於打造多元且具凝聚力的體驗，是創造全系精彩回憶的核心引擎。",
  joinBlurb: "加入活動部，你將親手策劃系上各大精彩活動，從活動企劃、現場控場到拉贊助談判，全方位解鎖最扎實的實戰技能。這不只是辦活動，更是與夥伴並肩創造共同回憶、點燃全系熱情的絕佳舞台。點亮圖資人的精彩生活，就差你一個！",
  services: [
    // href 先用 "#"，之後接服務頁；找不到圖會顯示佔位框。
    { name: "服務一（待補）", img: svcImg("eve1"), href: "#" },
    { name: "服務二（待補）", img: svcImg("eve2"), href: "#" },
  ],
  heads: [
    // 幹部照放 imports/members/eve1.png…（找不到＝照片待補）。
    { name: "蕭忻緹", cls: "B14", title: "部長", img: memImg("eve1") },
    { name: "莊雅雯", cls: "B14", title: "部長", img: memImg("eve2") },
  ],
  members: [
    { n: "張瑄予", c: "B14" },
    { n: "葛家妤", c: "B14" },
    { n: "呂程琳", c: "B14" },
  ],
};

export default eve;
