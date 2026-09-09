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
