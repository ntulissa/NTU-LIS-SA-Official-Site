// ── 各部門共用：型別 + 圖片對應工具 ───────────────────────────────
// 這些東西被「每個部門的資料檔（gen/eve/aca/ima/sp）」和「渲染元件 DepartmentPage」共同使用。
// 特意抽成獨立檔案，是為了打破「DepartmentPage → 各部門資料 → 又 import DepartmentPage」的循環依賴：
// 本檔不 import 任何部門資料，形成單向依賴（deptShared ← 各部門資料 ← departments ← DepartmentPage）。
//
// ★ 服務（各種業務）資料已經統一搬到 servicesData.ts 當單一來源：
//   - 部門頁右側的「服務輪播」改由 DepartmentPage 直接 servicesByDept(slug) 去撈；
//   - 所以各部門資料檔（gen.tsx…）不再需要寫 services，本檔的 DeptData 也拿掉了 services 欄位。
//   幹部照仍用 memImg；服務圖仍以 slug 命名放 imports/services/（部門頁輪播 svcImg(slug) 會用到）。

// ── 資料型別 ────────────────────────────────────────────────
export type Head = { name: string; cls: string; title: string; img: string };
export type Member = { n: string; c: string };
export type DeptData = {
  slug: string; // 路由用，如 "gen"；同時也是網址 #/dept/gen 與檔名
  zh: string; // 行政部
  en: string; // GENERAL AFFAIRS
  color: string; // 部門色
  intro: string; // 部門簡介
  joinBlurb: string; // 「成為…的一員」文案
  heads: Head[]; // 幹部（部長等）
  members: Member[]; // 部員
  // ※ services 已移除：服務清單改吃 servicesData.ts（見上方說明）
};

// ══════════ 圖片自動對應（丟檔就用）══════════
// 在 imports/ 底下開「兩個共用資料夾」：
//   imports/services/ ← 服務圖，以 slug 命名（如 locker.png、fee.svg…）→ 部門頁輪播與詳情頁共用。
//                       支援各部門子資料夾（如 imports/services/IMG-gen/locker.png），glob 會遞迴掃描（**）。
//   imports/members/  ← 幹部照，如 行政部：gen1.png、gen2.png、gen3.png…
// 用相對路徑（從本檔 department-pages/ 往上三層到 imports/），避免 @/ 別名在 import.meta.glob 不生效。
// ★ 新增/替換圖片後，若畫面沒更新，請重啟一次 dev server（glob 於啟動時掃描資料夾）。
const SERVICE_IMGS = import.meta.glob("../../../imports/services/**/*.{png,jpg,jpeg,webp,svg}", { eager: true, import: "default" }) as Record<string, string>;
const MEMBER_IMGS = import.meta.glob("../../../imports/members/**/*.{png,jpg,jpeg,webp}", { eager: true, import: "default" }) as Record<string, string>;

// 依檔名（不含副檔名）取圖，找不到回空字串（會顯示佔位框）。
// 用 /<file>. 比對「路徑結尾的檔名」，所以放在哪個子資料夾都找得到（如 IMG-gen/locker.png）。
function pickImg(rec: Record<string, string>, file: string): string {
  const hit = Object.entries(rec).find(([path]) => path.includes(`/${file}.`));
  return hit ? hit[1] : "";
}
export const svcImg = (file: string) => pickImg(SERVICE_IMGS, file);
export const memImg = (file: string) => pickImg(MEMBER_IMGS, file);