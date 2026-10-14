import zhTW from "../i18n/locales/zh-TW";

// 頁面小標題的文字已經搬到翻譯檔：
//   中文 → src/ui/i18n/locales/zh-TW.ts 的 pageTitles
//   英文 → src/ui/i18n/locales/en.ts 的 pageTitles
// 這裡保留 PAGE_TITLES（中文版）只是為了相容舊程式碼。
export const PAGE_TITLES = zhTW.pageTitles;

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

export type PageTitleKey = keyof typeof zhTW.pageTitles;