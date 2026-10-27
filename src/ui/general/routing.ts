// ══════════════════════════════════════════════════════════════════════════
// 網址與分頁（路由）
// ──────────────────────────────────────────────────────────────────────────
// 網站的分頁網址從「#/news」改成正常網址「/news」，Google 才能把每一頁分開收錄。
// 英文版網址前面加 /en，例如：
//
//   中文：https://www.ntulissa.com/news/welcome2026
//   英文：https://www.ntulissa.com/en/news/welcome2026
//
// ★ 舊的 #/news 寫法「完全不用改」：
//   各頁元件裡的 href="#/xxx"、window.location.hash = "#/xxx" 都會被 App.tsx 自動轉成新網址，
//   已經分享出去的舊連結（例如 https://www.ntulissa.com/#/news）也會自動轉到 /news。
//
// 所有分頁一覽（新增分頁時，這裡的 Route、parseRoute、routeToPath 三處都要加）：
//   /                 → 捲動式主頁
//   /about            → 學會簡介
//   /overview         → 資訊總覽
//   /current-team     → 現任團隊
//   /presidents       → 歷任會長
//   /news             → 公告列表
//   /news/<slug>      → 單篇公告（slug 同 news.ts）
//   /calendar         → 系學會行事曆
//   /services         → 各部業務 Bento 總覽
//   /service/<slug>   → 單一服務（slug 同 servicesData.ts）
//   /dept/<slug>      → 部門頁（例：/dept/gen ＝行政部）
//   /resources        → 學習資源
//   /contact          → 聯絡我們
//   /fees             → 系學會費
//   /sponsor          → 贊助我們
//   /join             → 加入我們
//   /dept-quiz        → 部門適性測驗
// ══════════════════════════════════════════════════════════════════════════

export type RouteLang = "zh-TW" | "en";

export type Route =
  | { name: "home" }
  | { name: "about" }
  | { name: "resources" }
  | { name: "current-team" }
  | { name: "presidents" }
  | { name: "join" }
  | { name: "dept-quiz" }
  | { name: "contact" }
  | { name: "overview" }
  | { name: "news" }
  | { name: "article"; slug: string }
  | { name: "calendar" }
  | { name: "fees" }
  | { name: "sponsor" }
  | { name: "dept"; slug: string }
  | { name: "services" }
  | { name: "service"; slug: string };

/** 沒有參數的分頁（網址＝ /<名稱>） */
export const STATIC_ROUTE_NAMES = [
  "about",
  "overview",
  "current-team",
  "presidents",
  "news",
  "calendar",
  "services",
  "resources",
  "contact",
  "fees",
  "sponsor",
  "join",
  "dept-quiz",
] as const;

type StaticRouteName = (typeof STATIC_ROUTE_NAMES)[number];

const EN_PREFIX = "/en";

/** 去掉結尾斜線、確保開頭有斜線："/news/" → "/news"，"" → "/" */
function cleanPath(path: string): string {
  let p = path || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p || "/";
}

/** 把網址的路徑拆成「語言」和「不含語言的路徑」："/en/news" → { en, "/news" } */
export function splitLang(pathname: string): { lang: RouteLang; path: string } {
  const p = cleanPath(pathname);
  if (p === EN_PREFIX) return { lang: "en", path: "/" };
  if (p.startsWith(`${EN_PREFIX}/`)) return { lang: "en", path: cleanPath(p.slice(EN_PREFIX.length)) };
  return { lang: "zh-TW", path: p };
}

/** 加上語言："/news" + en → "/en/news"；"/" + en → "/en"；中文不加 */
export function withLang(path: string, lang: RouteLang): string {
  const p = cleanPath(path);
  if (lang !== "en") return p;
  return p === "/" ? EN_PREFIX : `${EN_PREFIX}${p}`;
}

/** 不含語言的路徑 → 分頁。找不到的網址一律顯示主頁。 */
export function parseRoute(path: string): Route {
  const parts = cleanPath(path).split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home" };
  const [first, second] = parts;
  if (parts.length === 1 && (STATIC_ROUTE_NAMES as readonly string[]).includes(first)) {
    return { name: first as StaticRouteName };
  }
  if (parts.length === 2 && second) {
    if (first === "news") return { name: "article", slug: second };
    if (first === "service") return { name: "service", slug: second };
    if (first === "dept") return { name: "dept", slug: second };
  }
  return { name: "home" };
}

/** 分頁 → 不含語言的路徑 */
export function routeToPath(route: Route): string {
  switch (route.name) {
    case "home":
      return "/";
    case "article":
      return `/news/${route.slug}`;
    case "service":
      return `/service/${route.slug}`;
    case "dept":
      return `/dept/${route.slug}`;
    default:
      return `/${route.name}`;
  }
}

// ── 以下只在瀏覽器裡用 ───────────────────────────────────────────────

/** 目前網址的語言（看網址有沒有 /en） */
export function currentUrlLang(): RouteLang {
  return splitLang(window.location.pathname).lang;
}

/** 目前網址「不含語言」的路徑，例如在 /en/news 時回傳 /news */
export function currentPath(): string {
  return splitLang(window.location.pathname).path;
}

/** 目前所在的分頁 */
export function currentRoute(): Route {
  return parseRoute(currentPath());
}

/** 移除網址上舊的 ?lang= 參數（語言已經改放在 /en 路徑裡） */
function searchWithoutLang(search: string): string {
  const params = new URLSearchParams(search);
  params.delete("lang");
  const s = params.toString();
  return s ? `?${s}` : "";
}

/**
 * 舊網址 → 新網址（不重新整理頁面）：
 *   /#/news            → /news
 *   /?lang=en#/news/x  → /en/news/x
 *   /?lang=en          → /en
 * 有轉換就回傳 true。
 */
export function upgradeLegacyUrl(): boolean {
  const { pathname, search, hash } = window.location;
  const legacyEn = new URLSearchParams(search).get("lang")?.toLowerCase().startsWith("en") ?? false;
  const { lang, path } = splitLang(pathname);
  const targetLang: RouteLang = legacyEn ? "en" : lang;
  const hasLangParam = new URLSearchParams(search).has("lang");

  let targetPath = path;
  let targetHash = hash;
  if (hash.startsWith("#/")) {
    targetPath = hash.slice(1);
    targetHash = "";
  }
  if (!hasLangParam && targetPath === path && targetHash === hash) return false;

  const next = `${withLang(targetPath, targetLang)}${searchWithoutLang(search)}${targetHash}`;
  window.history.replaceState(window.history.state, "", next);
  return true;
}

/** App.tsx 監聽這個事件來換頁 */
export const NAVIGATE_EVENT = "lissa:navigate";

/**
 * 站內換頁（不重新整理）。to 是「不含語言」的路徑，可帶錨點，例如 "/news"、"/#team"。
 * 語言沿用目前網址的語言。
 */
export function navigate(to: string, options: { replace?: boolean } = {}) {
  const hashIndex = to.indexOf("#");
  const path = hashIndex >= 0 ? to.slice(0, hashIndex) : to;
  const hash = hashIndex >= 0 ? to.slice(hashIndex) : "";
  const queryIndex = path.indexOf("?");
  const purePath = queryIndex >= 0 ? path.slice(0, queryIndex) : path;
  const query = queryIndex >= 0 ? path.slice(queryIndex) : "";
  const url = `${withLang(purePath || "/", currentUrlLang())}${query}${hash}`;
  if (options.replace) window.history.replaceState(window.history.state, "", url);
  else window.history.pushState(null, "", url);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/**
 * 把元件裡寫的連結（例如 "#/news"、"#"）換成真正的網址（"/news"、"/en/news"、"/"）。
 * 不是站內分頁連結（外部網址、#team 錨點、mailto: 等）就回傳 null，保持原樣。
 */
export function resolveSpaHref(href: string, lang: RouteLang): string | null {
  if (href === "#" || href === "#/") return withLang("/", lang);
  if (href.startsWith("#/")) {
    const target = href.slice(1);
    const hashIndex = target.indexOf("#", 1);
    const path = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
    const anchor = hashIndex >= 0 ? target.slice(hashIndex) : "";
    return `${withLang(path, lang)}${anchor}`;
  }
  return null;
}
