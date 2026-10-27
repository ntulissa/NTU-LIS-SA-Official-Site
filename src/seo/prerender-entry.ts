// ══════════════════════════════════════════════════════════════════════════
// build 專用：幫每一頁產生 HTML、sitemap.xml、robots.txt
// ──────────────────────────────────────────────────────────────────────────
// 執行 npm run build 時會自動跑（流程見 package.json 的 build 指令與 scripts/prerender-seo.mjs），
// 平常不用動這個檔案。
// ══════════════════════════════════════════════════════════════════════════

import { allRoutes, buildHead, routeLastModified, SITE_URL, type HeadData } from "./seo";
import { routeToPath, withLang, type RouteLang } from "../ui/general/routing";

const LANGS: RouteLang[] = ["zh-TW", "en"];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHeadTags(h: HeadData): string {
  const e = escapeHtml;
  const lines = [
    `<title>${e(h.title)}</title>`,
    `<meta name="description" content="${e(h.description)}" />`,
    `<link rel="canonical" href="${e(h.canonical)}" />`,
    `<link rel="alternate" hreflang="zh-Hant-TW" href="${e(h.alternates.zh)}" />`,
    `<link rel="alternate" hreflang="en" href="${e(h.alternates.en)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${e(h.alternates.zh)}" />`,
    `<meta property="og:type" content="${h.ogType}" />`,
    `<meta property="og:site_name" content="${e(h.siteName)}" />`,
    `<meta property="og:locale" content="${h.ogLocale}" />`,
    `<meta property="og:title" content="${e(h.title)}" />`,
    `<meta property="og:description" content="${e(h.description)}" />`,
    `<meta property="og:url" content="${e(h.canonical)}" />`,
    `<meta property="og:image" content="${e(h.image)}" />`,
    ...(h.publishedTime ? [`<meta property="article:published_time" content="${h.publishedTime}" />`] : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${e(h.title)}" />`,
    `<meta name="twitter:description" content="${e(h.description)}" />`,
    `<meta name="twitter:image" content="${e(h.image)}" />`,
  ];
  return lines.join("\n    ");
}

const SEO_BLOCK = /<!--\s*seo:start\s*-->[\s\S]*?<!--\s*seo:end\s*-->/;

/** 把 index.html 的 SEO 區塊換成某一頁的內容 */
function renderPage(template: string, head: HeadData): string {
  if (!SEO_BLOCK.test(template)) {
    throw new Error("index.html 裡找不到 <!-- seo:start --> … <!-- seo:end --> 區塊，請不要刪掉這兩行註解。");
  }
  return template
    .replace(SEO_BLOCK, `<!-- seo:start -->\n    ${renderHeadTags(head)}\n    <!-- seo:end -->`)
    .replace(/<html([^>]*)\slang="[^"]*"/, `<html$1 lang="${head.htmlLang}"`);
}

/** 網址路徑 → dist 裡的檔名（搭配 vercel.json 的 cleanUrls） */
function fileNameFor(urlPath: string): string {
  return urlPath === "/" ? "index.html" : `${urlPath.slice(1)}.html`;
}

export type PrerenderedFile = { file: string; content: string };

/** 產生所有要寫進 dist 的檔案 */
export function buildFiles(template: string): PrerenderedFile[] {
  const files: PrerenderedFile[] = [];
  const routes = allRoutes();

  for (const route of routes) {
    for (const lang of LANGS) {
      const head = buildHead(route, lang);
      files.push({ file: fileNameFor(withLang(routeToPath(route), lang)), content: renderPage(template, head) });
    }
  }

  // sitemap.xml：每一頁的中英文版本都列出來，並互相標示語言
  const urls = routes.flatMap((route) => {
    const path = routeToPath(route);
    const zh = `${SITE_URL}${withLang(path, "zh-TW")}`;
    const en = `${SITE_URL}${withLang(path, "en")}`;
    const lastmod = routeLastModified(route);
    return [zh, en].map(
      (loc) => `  <url>
    <loc>${escapeHtml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <xhtml:link rel="alternate" hreflang="zh-Hant-TW" href="${escapeHtml(zh)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeHtml(en)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(zh)}" />
  </url>`
    );
  });
  files.push({
    file: "sitemap.xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`,
  });

  files.push({
    file: "robots.txt",
    content: `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
  });

  return files;
}
