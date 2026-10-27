// ══════════════════════════════════════════════════════════════════════════
// 每一頁的 SEO 資訊（分頁標題、描述、正式網址、分享預覽）
// ──────────────────────────────────────────────────────────────────────────
// 這個檔案同時用在兩個地方：
//   1) 瀏覽器：換頁時，App.tsx 用 applyHeadToDocument() 更新分頁標題等資訊
//   2) build：scripts/prerender-seo.mjs 幫每一頁產生「自己的 HTML 檔」，
//      Google、Facebook、LINE、IG 不用執行 JavaScript 就看得到每頁的標題和描述
//
// ★ 想改某一頁在 Google 上顯示的標題或描述 → 改下面的 PAGE_TEXT。
// ★ 公告、服務頁的標題與描述會自動從 news.ts、servicesData.ts 抓，不用另外寫。
// ★ 這裡不能 import React 元件（build 時會在 Node 裡執行）。
// ══════════════════════════════════════════════════════════════════════════

import zhTW from "../ui/i18n/locales/zh-TW";
import en from "../ui/i18n/locales/en";
import { ANNOUNCEMENTS, getAnnouncement } from "../ui/latest/news.ts"; // 寫明 .ts：同資料夾還有 News.tsx，避免 Mac（不分大小寫）抓錯檔案
import { BENTO, DEPT_NAMES, serviceBySlug, type Dept } from "../ui/services/servicesData";
import { routeToPath, withLang, type Route, type RouteLang } from "../ui/general/routing.ts";

/** 正式網址（不要加結尾斜線）。換網域時只要改這裡。 */
export const SITE_URL = "https://www.ntulissa.com";

/** 分享到 FB／LINE／IG 時的預設預覽圖（放在 public/）。建議做一張 1200×630 的 og-image.png 再改這裡。 */
export const DEFAULT_SHARE_IMAGE = "/apple-touch-icon.png";

const HTML_LANG: Record<RouteLang, string> = { "zh-TW": "zh-Hant-TW", en: "en" };
const OG_LOCALE: Record<RouteLang, string> = { "zh-TW": "zh_TW", en: "en_US" };

const SITE_NAME: Record<RouteLang, string> = {
  "zh-TW": "臺大圖資系學會",
  en: "NTU LIS Student Association",
};
const TITLE_SEPARATOR: Record<RouteLang, string> = { "zh-TW": "｜", en: " | " };

// ── 首頁與各固定分頁的標題、描述 ─────────────────────────────────────────
// title 只寫頁面名稱，後面會自動加上「｜臺大圖資系學會」。
// 首頁例外：直接用 homeTitle（放進「臺大圖資」「台大圖資」「學生會」等大家會搜尋的字）。
const PAGE_TEXT = {
  "zh-TW": {
    homeTitle: "臺大圖資系學會｜國立臺灣大學圖書資訊學系學生會 NTU LIS SA",
    homeDescription:
      "國立臺灣大學圖書資訊學系系學會（臺大圖資系學會、台大圖資學生會、NTU LIS SA）官方網站：最新公告、活動行事曆、學習資源、系學會費與加入我們。",
    pages: {
      about: { title: zhTW.nav.intro, description: "認識臺大圖資系學會：國立臺灣大學圖書資訊學系的學生自治組織，我們的理念、組織架構與一年來的工作。" },
      overview: { title: zhTW.nav.overview, description: "臺大圖資系學會資訊總覽：系學會費、成員人數、活動與服務等重要數字一次看。" },
      "current-team": { title: zhTW.nav.team, description: "臺大圖資系學會現任團隊：正副會長與行政、活動、學術、形象宣傳、體育五大部門成員。" },
      presidents: { title: zhTW.nav.presidents, description: "國立臺灣大學圖書資訊學系系學會歷屆會長名單與傳承。" },
      news: { title: zhTW.nav.announcements, description: "臺大圖資系學會最新公告：招募、選舉、交接、學輔室與各項系上活動消息。" },
      calendar: { title: zhTW.nav.calendar, description: "臺大圖資系學會行事曆：迎新、系烤、聖誕大會、圖資之夜、小圖盃等系上活動時間與地點。" },
      services: { title: zhTW.nav.departments, description: "臺大圖資系學會提供的各項服務：系櫃租借、學輔室、教科書代訂、系服、系隊補助、迎新與各類活動。" },
      resources: { title: zhTW.nav.resources, description: "臺大圖資系學會整理的學習資源：選課攻略、課程地圖與圖資系相關學術資源。" },
      contact: { title: zhTW.nav.contact, description: "聯絡臺大圖資系學會：官方信箱、Instagram、Facebook 與 Threads。" },
      fees: { title: zhTW.nav.fees, description: "臺大圖資系學會費：繳費方式與五大會員權益（迎新免費、系櫃免租金、教科書團購、系服優惠、活動優惠）。" },
      sponsor: { title: zhTW.nav.sponsor, description: "贊助臺大圖資系學會：與國立臺灣大學圖書資訊學系學生合作的贊助方案與聯絡方式。" },
      join: { title: zhTW.nav.join, description: "加入臺大圖資系學會：行政部、活動部、學術部、形象宣傳部、體育部招募資訊。" },
      "dept-quiz": { title: "部門適性測驗", description: "幾個小問題，找出最適合你的臺大圖資系學會部門。" },
    },
    article: "近期公告",
    service: "各部業務",
    deptDescription: (name: string) => `臺大圖資系學會${name}介紹：部門業務、幹部與成員。`,
  },
  en: {
    homeTitle: "NTU LIS Student Association | Official Site",
    homeDescription:
      "Official website of the Student Association of the Department of Library and Information Science, National Taiwan University (NTU LIS SA): announcements, event calendar, learning resources, membership and how to join.",
    pages: {
      about: { title: en.nav.intro, description: "Meet the NTU LIS Student Association — the student-run association of the Department of Library and Information Science at National Taiwan University." },
      overview: { title: en.nav.overview, description: "NTU LIS Student Association at a glance: membership, team size, events and services." },
      "current-team": { title: en.nav.team, description: "The current NTU LIS Student Association team: presidents and the five departments — General Affairs, Events, Academic Affairs, Media & Design and Sports." },
      presidents: { title: en.nav.presidents, description: "Past presidents of the NTU LIS Student Association." },
      news: { title: en.nav.announcements, description: "Latest announcements from the NTU LIS Student Association: recruitment, elections, handovers and department events." },
      calendar: { title: en.nav.calendar, description: "NTU LIS Student Association event calendar: orientation, BBQ, Christmas party, LIS Night, LIS Cup and more." },
      services: { title: en.nav.departments, description: "Services from the NTU LIS Student Association: lockers, lounge access, textbook orders, department apparel, team funding and events." },
      resources: { title: en.nav.resources, description: "Learning resources from the NTU LIS Student Association: course guides, course maps and LIS academic resources." },
      contact: { title: en.nav.contact, description: "Contact the NTU LIS Student Association by email, Instagram, Facebook or Threads." },
      fees: { title: en.nav.fees, description: "NTU LIS Student Association membership fee: how to pay and the five member benefits." },
      sponsor: { title: en.nav.sponsor, description: "Sponsor the NTU LIS Student Association and partner with LIS students at National Taiwan University." },
      join: { title: en.nav.join, description: "Join the NTU LIS Student Association: recruitment for General Affairs, Events, Academic Affairs, Media & Design and Sports." },
      "dept-quiz": { title: "Department Quiz", description: "Answer a few quick questions to find the NTU LIS Student Association department that fits you best." },
    },
    article: "Announcements",
    service: "Departments",
    deptDescription: (name: string) => `The ${name} department of the NTU LIS Student Association: what we do and who we are.`,
  },
} satisfies Record<RouteLang, unknown>;

/** 一頁的 SEO 資訊 */
export type HeadData = {
  lang: RouteLang;
  htmlLang: string;
  title: string;
  description: string;
  /** 這一頁的正式網址（含語言） */
  canonical: string;
  /** 中文版、英文版網址（告訴 Google 兩個是同一頁的不同語言） */
  alternates: { zh: string; en: string };
  image: string;
  ogType: "website" | "article";
  ogLocale: string;
  siteName: string;
  /** 文章發布日期（ISO 格式），只有公告頁有 */
  publishedTime?: string;
};

/** "/news" → "https://www.ntulissa.com/news" */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 把長段文字縮成適合放在搜尋結果的長度 */
function summarize(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** "2026.10.10" → "2026-10-10" */
function isoDate(date: string): string | undefined {
  const m = date.match(/(\d{4})\D(\d{1,2})\D(\d{1,2})/);
  if (!m) return undefined;
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

function pickEn(zh: string, enValue: string | undefined, lang: RouteLang): string {
  return lang === "en" && enValue ? enValue : zh;
}

function withSiteName(title: string, lang: RouteLang): string {
  return `${title}${TITLE_SEPARATOR[lang]}${SITE_NAME[lang]}`;
}

/** 算出某一頁、某語言的 SEO 資訊 */
export function buildHead(route: Route, lang: RouteLang): HeadData {
  const text = PAGE_TEXT[lang];
  const descMax = lang === "en" ? 160 : 110;
  let title = text.homeTitle;
  let description = text.homeDescription;
  let image = DEFAULT_SHARE_IMAGE;
  let ogType: HeadData["ogType"] = "website";
  let publishedTime: string | undefined;

  switch (route.name) {
    case "home":
      break;
    case "article": {
      const a = getAnnouncement(route.slug);
      if (a) {
        const articleTitle = pickEn(a.title, a.titleEn, lang);
        const paragraphs = lang === "en" && a.paragraphsEn?.length ? a.paragraphsEn : a.paragraphs;
        const excerpt = pickEn(a.excerpt, a.excerptEn, lang);
        // 摘要太短（例如「各位親愛的 B15 同學們好：」）時，改用內文開頭當描述
        const body = excerpt.length >= 30 ? excerpt : `${excerpt} ${paragraphs.join(" ")}`;
        title = withSiteName(articleTitle, lang);
        description = summarize(body, descMax);
        // 很小的圖片會被打包成 data: 網址，不能當分享預覽圖，這時用預設圖
        if (a.image && !a.image.startsWith("data:")) image = a.image;
        ogType = "article";
        publishedTime = isoDate(a.date);
      } else {
        title = withSiteName(text.article, lang);
        description = text.pages.news.description;
      }
      break;
    }
    case "service": {
      const s = serviceBySlug(route.slug);
      if (s) {
        const name = pickEn(s.zh, s.nameEn, lang);
        title = withSiteName(`${name}${TITLE_SEPARATOR[lang]}${text.service}`, lang);
        description = summarize(pickEn(s.intro, s.introEn, lang), descMax);
      } else {
        title = withSiteName(text.service, lang);
        description = text.pages.services.description;
      }
      break;
    }
    case "dept": {
      const names = DEPT_NAMES[route.slug as Dept];
      const name = names ? (lang === "en" ? names.en : names.zh) : text.service;
      title = withSiteName(name, lang);
      description = text.deptDescription(name);
      break;
    }
    default: {
      const page = text.pages[route.name];
      title = withSiteName(page.title, lang);
      description = page.description;
    }
  }

  const path = routeToPath(route);
  return {
    lang,
    htmlLang: HTML_LANG[lang],
    title,
    description,
    canonical: absoluteUrl(withLang(path, lang)),
    alternates: { zh: absoluteUrl(withLang(path, "zh-TW")), en: absoluteUrl(withLang(path, "en")) },
    image: absoluteUrl(image),
    ogType,
    ogLocale: OG_LOCALE[lang],
    siteName: SITE_NAME[lang],
    publishedTime,
  };
}

/** 全站所有分頁（sitemap 與 build 預先產生 HTML 用） */
export function allRoutes(): Route[] {
  const routes: Route[] = [{ name: "home" }];
  const fixed: Route["name"][] = [
    "about", "overview", "current-team", "presidents", "news", "calendar",
    "services", "resources", "contact", "fees", "sponsor", "join", "dept-quiz",
  ];
  for (const name of fixed) routes.push({ name } as Route);
  for (const a of ANNOUNCEMENTS) routes.push({ name: "article", slug: a.slug });
  for (const cell of BENTO) if (cell.type === "service") routes.push({ name: "service", slug: cell.slug });
  for (const dept of Object.keys(DEPT_NAMES)) routes.push({ name: "dept", slug: dept });
  return routes;
}

/** 公告頁的日期（sitemap 的 lastmod 用） */
export function routeLastModified(route: Route): string | undefined {
  if (route.name !== "article") return undefined;
  const a = getAnnouncement(route.slug);
  return a ? isoDate(a.date) : undefined;
}

// ── 瀏覽器：把 SEO 資訊寫進 <head> ─────────────────────────────────────

function upsertMeta(attr: "name" | "property", key: string, content: string | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

export function applyHeadToDocument(head: HeadData) {
  document.documentElement.lang = head.htmlLang;
  document.title = head.title;
  upsertMeta("name", "description", head.description);
  upsertLink('link[rel="canonical"]', { rel: "canonical", href: head.canonical });
  upsertLink('link[rel="alternate"][hreflang="zh-Hant-TW"]', { rel: "alternate", hreflang: "zh-Hant-TW", href: head.alternates.zh });
  upsertLink('link[rel="alternate"][hreflang="en"]', { rel: "alternate", hreflang: "en", href: head.alternates.en });
  upsertLink('link[rel="alternate"][hreflang="x-default"]', { rel: "alternate", hreflang: "x-default", href: head.alternates.zh });
  upsertMeta("property", "og:type", head.ogType);
  upsertMeta("property", "og:site_name", head.siteName);
  upsertMeta("property", "og:locale", head.ogLocale);
  upsertMeta("property", "og:title", head.title);
  upsertMeta("property", "og:description", head.description);
  upsertMeta("property", "og:url", head.canonical);
  upsertMeta("property", "og:image", head.image);
  upsertMeta("property", "article:published_time", head.publishedTime);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", head.title);
  upsertMeta("name", "twitter:description", head.description);
  upsertMeta("name", "twitter:image", head.image);
}
