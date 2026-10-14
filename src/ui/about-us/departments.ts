// ── 部門資料 ────────────────────────────────────────────────
// 新增或調整部門資料時，直接編輯下方對應的 slug。
// 英文版：nameEn / introEn / joinBlurbEn；幹部 titleEn（職稱）、nameEn（英文名，沒填就顯示中文名）。
import { memImg, type DeptData } from "./deptShared";
import type { Lang } from "../i18n";

export const DEPARTMENTS: Record<string, DeptData> = {
  gen: {
    slug: "gen",
    zh: "行政部",
    nameEn: "General Affairs",
    en: "GENERAL AFFAIRS",
    color: "#B07C43",
    intro:
      "行政部為第 52 屆系學會自「召部執秘」獨立出來的專責部門，扮演組織運作最堅實的後勤骨幹。部門主責帳目管理（含系學會費收繳與財務透明化）、系館公共空間管理（如學輔室營運、設備維護與系櫃申請辦理）以及各項行政文書工作。透過將繁雜的行政與後勤業務專業化、制度化，行政部確保了系學會整體運作的高效與透明，為各項活動與學會政策提供穩固的支援體系。",
    introEn:
      "Established as a standalone department in the 52nd association, General Affairs is the backbone of our operations. It manages the accounts (including membership fee collection and financial transparency), the department's shared spaces (the student lounge, equipment and locker applications) and all administrative paperwork. By making these processes professional and systematic, General Affairs keeps the association efficient and transparent, and gives every event and policy solid support.",
    joinBlurb:
      "加入行政部，你將成為全系運作最核心的幕後推手，掌管系館空間、財務與行政決策。這不只是會務，更是累積組織管理經驗、展現影響力的旅程。打造更完善的圖資系，就差你一個！",
    joinBlurbEn:
      "Join General Affairs and become the force behind everything in the department — managing spaces, finances and administrative decisions. It's more than paperwork: it's real organizational experience and real impact. Help us build a better LIS — we just need you!",
    heads: [
      { name: "林榮恩", cls: "B14", title: "部長", titleEn: "Director", img: memImg("gen2") },
      { name: "劉以寬", cls: "B14", title: "部長", titleEn: "Director", img: memImg("gen3") },
    ],
    members: [
      { n: "謝君兒", c: "B13" },
      { n: "羅良鎮", c: "B13" },
      { n: "廖誼晴", c: "B13" },
    ],
  },
  eve: {
    slug: "eve",
    zh: "活動部",
    nameEn: "Events",
    en: "EVENTS AFFAIRS",
    color: "#C24A4F",
    intro:
      "活動部主責系內外各項大中型活動的策劃與執行，並持續推動現有活動的優化與創新活動的開拓。從活動發想、流程設計、場地物資調度到對外拉贊助與廠商洽談，活動部致力於打造多元且具凝聚力的體驗，是創造全系精彩回憶的核心引擎。",
    introEn:
      "The Events department plans and runs medium and large events inside and outside the department, constantly improving existing events and creating new ones. From brainstorming and run-of-show design to venues, supplies, sponsorships and vendor negotiations, Events creates diverse experiences that bring people together — the engine behind the department's best memories.",
    joinBlurb:
      "加入活動部，你將親手策劃系上各大精彩活動，從活動企劃、現場控場到拉贊助談判，全方位解鎖最扎實的實戰技能。這不只是辦活動，更是與夥伴並肩創造共同回憶、點燃全系熱情的絕佳舞台。點亮圖資人的精彩生活，就差你一個！",
    joinBlurbEn:
      "Join Events and plan the department's biggest events yourself — from proposals and on-site coordination to sponsorship negotiations. It's more than running events: it's a stage to create memories with your teammates and fire up the whole department. Help light up LIS life — we just need you!",
    heads: [
      { name: "蕭忻緹", cls: "B14", title: "部長", titleEn: "Director", img: memImg("eve1") },
      { name: "莊雅雯", cls: "B14", title: "部長", titleEn: "Director", img: memImg("eve2") },
    ],
    members: [
      { n: "張瑄予", c: "B14" },
      { n: "葛家妤", c: "B14" },
      { n: "呂程琳", c: "B14" },
    ],
  },
  aca: {
    slug: "aca",
    zh: "學術部",
    nameEn: "Academic Affairs",
    en: "ACADEMIC AFFAIRS",
    color: "#5E8C3C",
    intro:
      "學術部專注於圖資系學術資源的整合與知識傳播，主責選課指南彙整、學術與系友職涯講座舉辦、杜鵑花節展覽策劃以及系刊採訪編寫等核心業務。透過系統化的內容產出與經驗傳承，學術部致力於幫助系上同學釐清學習方向、探索未來職涯，同時對外展現圖資領域的專業價值。",
    introEn:
      "Academic Affairs brings together LIS academic resources and shares knowledge. Its core work includes compiling the course selection guide, hosting academic and alumni career talks, curating our Azalea Festival exhibition, and interviewing and writing for the department magazine. Through systematic content and passing on experience, it helps students find their direction in study and career — and shows the world the value of LIS.",
    joinBlurb:
      "加入學術部，你將親自參與選課指引整理、系友講座籌辦、杜鵑花節展出與系刊採訪編輯，掌握從內容企劃到知識傳播的全套實戰力。這不只是整理資源，更是為大家指引學習與職涯方向的重要推手。與我們一起定義圖資人的專業，就差你一個！",
    joinBlurbEn:
      "Join Academic Affairs to work on the course guide, alumni talks, the Azalea Festival exhibition and the department magazine — real skills from content planning to sharing knowledge. It's more than organizing resources: you'll help everyone find their way in study and career. Help define what LIS stands for — we just need you!",
    heads: [
      { name: "周家禾", cls: "B14", title: "部長", titleEn: "Director", img: memImg("aca1") },
    ],
    members: [
      { n: "許瑞米", c: "B14" },
      { n: "郭庭妤", c: "B14" },
      { n: "陳明鈺", c: "B14" },
    ],
  },
  ima: {
    slug: "ima",
    zh: "形象宣傳部",
    nameEn: "Media & Design",
    en: "IMAGE AND PUBLICITY AFFAIRS",
    color: "#9C4A6E",
    intro:
      "形象宣傳部於第 52 屆系學會由傳統的「美宣、公關、行宣」三部整併而成，專責塑造與推廣系學會的品牌形象。部門主責社群媒體營運、主視覺與各類文宣品設計、活動現場動靜態攝影，以及對外廠商與校內外單位的公關聯繫。透過跨領域資源的整合，形象宣傳部以專業視覺與精準傳播，將系學會的最新動態與優質內容傳遞給全系同學與外界。",
    introEn:
      "Formed in the 52nd association by merging the former design, public relations and promotion departments, Media & Design shapes and promotes the association's brand. It runs our social media, designs key visuals and promotional materials, photographs and films events, and handles relations with vendors and organizations on and off campus. With strong visuals and clear communication, it brings our news and content to every student and beyond.",
    joinBlurb:
      "加入形象宣傳部，你將親自操刀社群經營、視覺設計、活動攝影以及對外公關聯繫，全面累積品牌行銷與多媒體創作實力。這不只是發文做圖，更是用你的美感與文字定義系學會的門面與風格。一起打造最吸睛的圖資品牌，就差你一個！",
    joinBlurbEn:
      "Join Media & Design to run social media, create visuals, shoot events and handle public relations — building real skills in branding and multimedia. It's more than posting and designing: your eye and your words will define the association's look and voice. Help build the most eye-catching brand in LIS — we just need you!",
    heads: [
      { name: "葉家米", cls: "B14", title: "部長", titleEn: "Director", img: memImg("ima1") },
    ],
    members: [
      { n: "戴愷昀", c: "B14" },
      { n: "石馨予", c: "B14" },
    ],
  },
  sp: {
    slug: "sp",
    zh: "體育部",
    nameEn: "Sports",
    en: "SPORTS AFFAIRS",
    color: "#23658A",
    intro:
      "體育部是臺大圖資系所有體育系隊最堅實的後盾，專責各系隊事務支援與經費補助管理，協助各大系隊順暢運作與參賽；同時主責籌辦系內外體育賽事（如小圖盃等），致力於推廣全系運動風氣，搭建系上同學切磋球技、熱血交流的最佳平台。",
    introEn:
      "The Sports department is the backbone of every NTU LIS sports team. It supports team affairs and manages team funding so teams can train and compete smoothly, and it organizes sports events inside and outside the department (such as the LIS Cup) — promoting an active culture and giving students the best place to play and connect.",
    joinBlurb:
      "加入體育部，你將成為各大系隊最強大的幕後靠山，親手籌辦系上各項體育賽事並管理資源補助。這不只是體育行政，更是帶動全系運動風氣、凝聚球場向心力與熱血回憶的關鍵角色。與我們一起點燃圖資人的運動魂，就差你一個！",
    joinBlurbEn:
      "Join Sports and become the strongest support for our teams — organizing tournaments and managing team funding yourself. It's more than sports admin: you'll drive the department's sporting spirit and create memories on and off the court. Help ignite the LIS team spirit — we just need you!",
    heads: [
      { name: "葛家妤", cls: "B14", title: "部長", titleEn: "Director", img: memImg("sp1") },
      { name: "張毓琳", cls: "B14", title: "部長", titleEn: "Director", img: memImg("sp2") },
    ],
    members: [{ n: "劉以寬", c: "B14" }],
  },
};

// ── 各部門 Hashtag ──────────────────────────────────────────
// 顯示在部門簡介下方；這裡只放純文字，前面的「#」由頁面自動加上。
// gen 為官網示意值；其餘為暫定，請自行替換成各部門實際標語。
export const DEPT_HASHTAGS: Record<string, string[]> = {
  gen: ["財務規劃", "公產租借", "行政文書"],
  eve: ["活動企劃", "協商接洽", "現場統籌"],
  aca: ["學術講座", "課業資源", "企業參訪"],
  ima: ["視覺設計", "社群經營", "品牌合作"],
  sp: ["賽事籌辦", "運動推廣", "系隊支柱"],
};

// 英文版 Hashtag（順序不必和中文一樣）
export const DEPT_HASHTAGS_EN: Record<string, string[]> = {
  gen: ["FinancialPlanning", "SpaceAndLockers", "Admin"],
  eve: ["EventPlanning", "Negotiation", "OnSiteCoordination"],
  aca: ["AcademicTalks", "StudyResources", "CompanyVisits"],
  ima: ["VisualDesign", "SocialMedia", "BrandPartnerships"],
  sp: ["Tournaments", "ActiveLife", "TeamSupport"],
};

export function deptHashtags(slug: string, lang: Lang): string[] {
  return (lang === "en" ? DEPT_HASHTAGS_EN[slug] : undefined) ?? DEPT_HASHTAGS[slug] ?? [];
}