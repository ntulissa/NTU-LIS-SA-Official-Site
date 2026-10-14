// ══════════════════════════════════════════════════════════════════════════
// 繁體中文翻譯檔
// ──────────────────────────────────────────────────────────────────────────
// ★ 要改網站上的中文字，改這裡就好。
// ★ 新增一行文字時：這裡加一行，en.ts 也要加同名的一行（沒加的話編輯器會標紅提醒你）。
// ══════════════════════════════════════════════════════════════════════════

const zhTW = {
  // 網頁分頁標題與搜尋引擎描述
  meta: {
    title: "臺大圖資系學會 NTU LIS SA Official Site",
    description: "國立臺灣大學圖書資訊學系系學會官方網站：最新公告、活動行事曆、學術資源、系學會費與加入我們。",
  },

  // 語言切換按鈕
  lang: {
    switchLabel: "切換語言",
    zh: "中",
    en: "EN",
  },

  // 導覽列（Header）與 Footer 共用的選單文字
  nav: {
    about: "關於我們",
    overview: "資訊總覽",
    intro: "學會簡介",
    team: "現任團隊",
    presidents: "歷任會長",

    news: "最新動態",
    announcements: "近期公告",
    calendar: "系學會行事曆",

    services: "各種服務",
    departments: "各部業務",
    resources: "學習資源",
    contact: "聯絡我們",

    support: "支持我們",
    fees: "系學會費",
    sponsor: "贊助我們",

    join: "加入我們",

    openMenu: "開啟選單",
    closeMenu: "關閉選單",
  },

  // Footer
  footer: {
    logoAlt: "臺大圖資系學會 Logo",
    description: "國立臺灣大學圖書資訊學系學生自治組織，致力於促進學術交流與同學福祉。",
    copyright: "© 2026 臺大圖資系學會 NTU LIS Student Association. All rights reserved.",
  },

  // 畫面底部「往下繼續探索」提示
  scrollHint: "往下繼續探索",

  // 每頁左上角的小標題（「— 關於我們・學會簡介」）
  pageTitles: {
    aboutIntro: "關於我們・學會簡介",
    aboutTeam: "關於我們・現任團隊",
    aboutPastPresidents: "關於我們・歷任會長",
    newsUpdates: "最新動態・近期公告",
    newsCalendar: "最新動態・系學會行事曆",
    servicesResources: "各種服務・學習資源",
    servicesContact: "各種服務・聯絡我們",
    servicesDepartments: "各種服務・各部業務",
    supportFees: "支持我們・系學會費",
    supportSponsors: "支持我們・贊助我們",
    joinUs: "加入我們",
  },
};

export default zhTW;

// 所有語言共用的「格式」：en.ts 必須和這裡長得一模一樣（只是文字不同）。
export type Messages = typeof zhTW;