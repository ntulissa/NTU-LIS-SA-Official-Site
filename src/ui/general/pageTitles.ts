export const PAGE_TITLES = {
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
} as const;

/**
 * 全站共用的左右間距（Header 和頁面小標題都用這一個）
 * 只要改這裡，Logo 和每一頁的小標題就會一起移動，永遠對齊。
 * 手機 20px／平板以上 32px
 */
export const SITE_GUTTER = "px-5 sm:px-8";

export const PAGE_TITLE_LAYOUT = {
  top: "112px",
  // 拿掉 max-w + mx-auto（大螢幕時會把標題往中間推）
  // 拿掉 md:px-14（56px，比 Header 多縮排，造成標題偏右）
  textClassName: `w-full ${SITE_GUTTER} tracking-widest`,
} as const;

export type PageTitleKey = keyof typeof PAGE_TITLES;