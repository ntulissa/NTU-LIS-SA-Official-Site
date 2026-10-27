// ══════════════════════════════════════════════════════════════════════════
// build 最後一步：幫每一頁產生自己的 HTML（含專屬標題、描述、canonical），
// 並產生 sitemap.xml 與 robots.txt。
//
// 流程（npm run build 會自動依序執行）：
//   1. vite build                       → 一般的網站打包，輸出到 dist/
//   2. vite build --ssr src/seo/...     → 把 SEO 資料打包成 Node 可以執行的檔案（.seo-build/）
//   3. node scripts/prerender-seo.mjs   → 就是這個檔案：讀 dist/index.html 當模板，寫出每一頁
// ══════════════════════════════════════════════════════════════════════════

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const distDir = path.join(root, "dist");
const seoBuildDir = path.join(root, ".seo-build");

const entry = path.join(seoBuildDir, "prerender-entry.js");
const { buildFiles } = await import(pathToFileURL(entry).href);

const template = await readFile(path.join(distDir, "index.html"), "utf8");
const files = buildFiles(template);

for (const { file, content } of files) {
  const target = path.join(distDir, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

await rm(seoBuildDir, { recursive: true, force: true });

const pages = files.filter((f) => f.file.endsWith(".html")).length;
console.log(`✓ SEO：已產生 ${pages} 個頁面、sitemap.xml、robots.txt`);