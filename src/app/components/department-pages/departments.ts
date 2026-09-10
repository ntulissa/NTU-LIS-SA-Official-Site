// ── 部門登記表 ──────────────────────────────────────────────
// slug → 部門資料。slug 同時也是網址（#/dept/<slug>）與檔名。
// ★ 要新增／調整部門：改對應的 gen/eve/aca/ima/sp.tsx，再確認這裡有 import 進來即可。
import type { DeptData } from "./deptShared";
import { gen } from "./gen";
import { eve } from "./eve";
import { aca } from "./aca";
import { ima } from "./ima";
import { sp } from "./sp";

export const DEPARTMENTS: Record<string, DeptData> = {
  gen, // 行政部
  eve, // 活動部
  aca, // 學術部
  ima, // 形象宣傳部
  sp, // 體育部
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