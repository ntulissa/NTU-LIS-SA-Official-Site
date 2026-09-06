// ── 行政部 GENERAL AFFAIRS ──────────────────────────────────
// 這是「一個部門一個檔」的範本：其他部門（eve/aca/ima/sp）都比照本檔結構，改文字與名單即可。
import { svcImg, memImg, type DeptData } from "./deptShared";

export const gen: DeptData = {
  slug: "gen", // 網址：#/dept/gen
  zh: "行政部",
  en: "GENERAL AFFAIRS",
  color: "#B07C43",
  intro:
    "行政部為第 52 屆系學會自「召部執秘」獨立出來的專責部門，扮演組織運作最堅實的後勤骨幹。部門主責帳目管理（含系學會費收繳與財務透明化）、系館公共空間管理（如學輔室營運、設備維護與系櫃申請辦理）以及各項行政文書工作。透過將繁雜的行政與後勤業務專業化、制度化，行政部確保了系學會整體運作的高效與透明，為各項活動與學會政策提供穩固的支援體系。",
  joinBlurb:
    "加入行政部，你將成為全系運作最核心的幕後推手，掌管系館空間、財務與行政決策。這不只是會務，更是累積組織管理經驗、展現影響力的旅程。打造更完善的圖資系，就差你一個！",
  services: [
    // 服務圖放 imports/services/gen1.png、gen2.png（找不到會顯示佔位框）；href 先用 "#"，之後接服務頁。
    { name: "系櫃租借", img: svcImg("gen1"), href: "https://forms.gle/hsiidFFAwG9EmJJX6" },
    { name: "系學會費", img: svcImg("gen2"), href: "https://forms.gle/hsiidFFAwG9EmJJX6" },
  ],
  heads: [
    // 幹部照放 imports/members/gen1.png、gen2.png、gen3.png（找不到＝照片待補）。
    { name: "林榮恩", cls: "B14", title: "部長", img: memImg("gen2") },
    { name: "劉以寬", cls: "B14", title: "部長", img: memImg("gen3") },
  ],
  members: [
    { n: "謝君兒", c: "B13" },
    { n: "羅良鎮", c: "B13" },
    { n: "廖誼晴", c: "B13" },
  ],
};

export default gen;
