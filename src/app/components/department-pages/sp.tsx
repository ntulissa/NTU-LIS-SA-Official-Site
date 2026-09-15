// ── 體育部 SPORTS ───────────────────────────────────────────
// 結構完全比照 gen.tsx（行政部）。把下面的 intro／joinBlurb／services／heads／members 換成本部門的內容即可。
// 服務圖放 imports/services/IMG-sp/；幹部照放 imports/members/。
import { svcImg, memImg, type DeptData } from "./deptShared";

export const sp: DeptData = {
  slug: "sp", // 網址：#/dept/sp
  zh: "體育部",
  en: "SPORTS AFFAIRS", // 英文名可自行調整
  color: "#23658A",
  intro: "體育部是臺大圖資系所有體育系隊最堅實的後盾，專責各系隊事務支援與經費補助管理，協助各大系隊順暢運作與參賽；同時主責籌辦系內外體育賽事（如小圖盃等），致力於推廣全系運動風氣，搭建系上同學切磋球技、熱血交流的最佳平台。",
  joinBlurb: "加入體育部，你將成為各大系隊最強大的幕後靠山，親手籌辦系上各項體育賽事並管理資源補助。這不只是體育行政，更是帶動全系運動風氣、凝聚球場向心力與熱血回憶的關鍵角色。與我們一起點燃圖資人的運動魂，就差你一個！",
  services: [
    { name: "臺大日文圖資男籃", slug: "men-basket", img: svcImg("men-basket"), href: "#" },
    { name: "臺大圖資女排", slug: "women-volley", img: svcImg("women-volley"), href: "#" },
    { name: "臺大圖資羽球", slug: "badminton", img: svcImg("badminton"), href: "#" },
    { name: "小圖盃", slug: "lis-cup", img: svcImg("lis-cup"), href: "#", open: false },
  ],
  heads: [
    { name: "葛家妤", cls: "B14", title: "部長", img: memImg("sp1") },
    { name: "張毓琳", cls: "B14", title: "部長", img: memImg("sp2") },
  ],
  members: [
    { n: "劉以寬", c: "B14" },
  ],
};

export default sp;
