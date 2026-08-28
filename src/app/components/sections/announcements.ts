// ══════════════════════════════════════════════════════════════════════════
// 公告資料（「公告列表頁」與「公告文章頁」共用同一份）。要新增／修改公告都改這裡。
// 放置位置建議：src/components/sections/announcements.ts
//
// 一篇公告 = 一個物件，欄位說明：
//   slug          網址代稱（只用英數與 -），文章頁網址＝ #/news/<slug>，不可重複。
//   category      右上角標籤文字（例："學會公告"）。
//   title         標題。
//   author        作者掛名（例："圖資四 曾柏翰"）；沒有就留空字串 ""。
//   date          日期字串（例："2026.08.12"）。
//   excerpt       列表卡片上的一句摘要。
//   paragraphs    內文，一段一個字串（陣列）；要幾段就放幾個字串。
//   image?        文章大圖：先在最上面 import 你的圖，再填在這裡。★不填＝這篇沒有圖（純文字排版）。
//   imageCaption? 圖說（有圖才會用到）。
// ══════════════════════════════════════════════════════════════════════════

// 範例文章的照片：先「暫時借用」現有的建築圖當佔位，確保專案能編譯、也能直接看到「有圖版型」。
// 換成真的照片：把照片放到 src/imports/LatestUpdates/ 後，改成 import 你的檔案即可，例如：
//   import inaugurationPhoto from "@/imports/LatestUpdates/53-inauguration.jpg";
import inaugurationPhoto from "@/imports/LatestUpdates/inauguration.png";

export type Announcement = {
  slug: string;
  category: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  paragraphs: string[];
  image?: string;
  imageCaption?: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  // ── 範例：有圖片的公告（版型參考你給的「上任公告」設計）───────────────
  {
    slug: "term-53-inauguration",
    category: "學會公告",
    title: "第 53 屆系學會上任公告",
    author: "臺大圖資系學會",
    date: "2026.08.12",
    excerpt: "臺大圖資系學會已於 7 月 30 日完成新舊團隊交接，第 53 屆正副會長黃子芸與洪聆雅團隊正式接任。",
    paragraphs: [
      "臺大圖資系學會已於 7 月 30 日順利完成交接，第 53 屆正副會長黃子芸與洪聆雅團隊正式接任，展開新學年的營運與服務。",
      "兩位正副會長在前一屆團隊中即擔任核心要職，深度參與會務運作，並在停辦四年之久、重磅回歸的「2026 圖資之夜」等重大專案中累積了扎實的實戰與籌備經驗。",
      "站在成熟的運作基礎上，第 53 屆系學會將全力推動學會品牌化。新團隊期望透過更具識別度的品牌視覺、全新官方網站的誕生，以及選課攻略等實用工具的整合，推動更多「看得到、摸得著」的具體工作，讓系學會的各項服務深度融入日常生活，使每位圖資人在大學四年中都能強烈感受到系學會的陪伴與存在。",
      "臺大圖資系學會絕非封閉運作的學生自治組織，而是真正屬於「全體圖資人的系學會」。新團隊將突破傳統框架、勇於嘗試與創新，推動更多兼具實質效益與多元趣味的專案，顛覆大家對自治組織的既定想像，讓所有人看見系學會原來真的可以這樣「玩」！"
    ],
    image: inaugurationPhoto, // ★換成你的照片：改最上面的 import；這篇不想要圖就把這行刪掉
    imageCaption: "第 52 屆會長曾柏翰（左）與第 53 屆會長黃子芸（右），於系主任羅思嘉教授（中）見證下順利完成印信交接儀式。（圖／臺大圖資系學會）",
  },

  // ── 以下沿用你原本列表的四則；先填摘要，內文再慢慢補（沒填 image＝純文字排版）──
  {
    slug: "b14-15-showcase",
    category: "學會公告",
    title: "B14~15 系學會發表會",
    author: "",
    date: "2026.08.12",
    excerpt: "系學會將在開學日舉辦發表會。將帶你快速熟悉系上資源、找到專屬夥伴與「大學生活避風港」的快速通關指南。",
    paragraphs: [
      "系學會將在開學日舉辦發表會，帶你快速熟悉系上資源、找到專屬夥伴，是通往「大學生活避風港」的快速通關指南。",
      "（這裡替換成完整內文；一段一個字串。）",
    ],
  },
  {
    slug: "term-52-farewell",
    category: "學會公告",
    title: "第 52 屆系學會卸任公告",
    author: "",
    date: "2026.07.30",
    excerpt: "親愛的圖資系同學、老師與系友們：第 52 屆系學會團隊的旅程，在今天正式劃下圓滿的句點。",
    paragraphs: [
      "親愛的圖資系同學們、老師與系友們：超過一半的大學生涯，四百多個日夜。第 52 屆系學會團隊的旅程，在今天正式劃下圓滿的句點。",
      "（這裡替換成完整內文。）",
    ],
  },
  {
    slug: "term-53-election-result",
    category: "學會公告",
    title: "第 53 屆正副會長選舉開票結果",
    author: "",
    date: "2026.06.01",
    excerpt: "本會於本月 1 日進行正副會長改選，由圖資二黃子芸、圖資二洪聆雅當選。",
    paragraphs: [
      "本會於本月 1 日進行正副會長改選。本次選舉由圖資二黃子芸、圖資二洪聆雅當選。",
      "（這裡替換成完整內文。）",
    ],
  },
  {
    slug: "club-evaluation-excellent",
    category: "學會公告",
    title: "系學會獲得社團評鑑自治組優等",
    author: "",
    date: "2026.05.20",
    excerpt: "在 114 學年度臺大全校社團評鑑中，臺大圖資系學會勇奪「自治性社團組 — 優等」的殊榮。",
    paragraphs: [
      "在剛落幕的 114 學年度臺大全校社團評鑑中，臺大圖資系學會在全校眾多自治組織中脫穎而出，勇奪「自治性社團組 — 優等」的殊榮。",
      "（這裡替換成完整內文。）",
    ],
  },
];

// 依 slug 找出某一篇公告（文章頁用）。
export function getAnnouncement(slug: string): Announcement | undefined {
  return ANNOUNCEMENTS.find((a) => a.slug === slug);
}
