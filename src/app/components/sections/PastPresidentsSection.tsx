import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./shared";

/**
 * 歷任會長頁（PAST PRESIDENTS）
 * ─────────────────────────────────────────────────────────────
 * ● 版面：左半可捲動（標題 → 第X屆 → 任期 → 簡介 → 團隊成員名單），
 *          右半 sticky 固定（會長照片、姓名、系級、英文名、屆數切換器）。
 * ● 切換器：中間是紅→藍漸層的屆數數字；左邊紅點、右邊藍點。
 *          滑鼠移到左紅點 → 放大成紅色「<」＝上一屆（較早）；
 *          滑鼠移到右藍點 → 放大成藍色「>」＝下一屆（較新）。端點自動停用。
 *
 * ★ 要新增／修改某一屆的資料，只要編輯下方的 PRESIDENTS 陣列即可，
 *   前後屆切換會自動生效（陣列請由「新 → 舊」排序）。
 */

// ── 字型（與全站一致；Chiron Hei HK 為商用字體，退回 Noto Sans TC）──
const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif"; // 姓名（中文）
const zhFont = "'Noto Sans TC', sans-serif"; // 內文
const monoFont = "'Ubuntu Sans Mono', monospace"; // 英文名 / 標籤 / 屆數
const enDisplay = "'Josefin Sans', sans-serif"; // 英文大標

// ── 資料型別 ────────────────────────────────────────────────
type Member = { n: string; c: string }; // n=姓名, c=系級（如 B13）
type Dept = {
  en: string; // 英文縮寫，如 GEN
  zh: string; // 中文部門名，如 行政部
  color: string; // 部門色（卡片外框）
  members: Member[];
};
type President = {
  gen: number; // 第幾屆，如 52
  name: string; // 會長中文姓名（留空字串＝資料待補）
  roman: string; // 英文名，如 PO-HAN, TSENG
  cls: string; // 會長系級，如 B12
  img: string; // 會長照片（見下方「照片怎麼放」；留空字串會顯示佔位框）
  intro: string; // 該屆簡介（留空字串會顯示「資料整理中」）
  depts: Dept[]; // 團隊成員（依 [GEN,SP,ACA,EVE,IMA,VP] 順序＝畫面左右兩欄排列）
};

/* ── 照片怎麼放（兩種做法擇一）────────────────────────────────
   (A) 沿用你現有的 @/imports 方式：在檔案最上方 import，再把變數指給 img。
       例：  import imgPohan from "@/imports/PastPresidents/pohan.png";
             ...在該屆物件裡：  img: imgPohan as string,
   (B) 直接放到 public/ 資料夾，用字串路徑：
             img: "/presidents/pohan.png",
   目前 img 先留空字串，畫面會顯示「照片待補」佔位框，不會壞掉。 */

// ── 部門色（比照 TeamSection，略提高彩度貼近設計稿；可自由調整）──
const C = {
  GEN: "#B07C43", // 行政部（橘棕）
  SP: "#8C7B6B", // 體育部（灰棕）
  ACA: "#5E8C3C", // 學術部（綠）
  EVE: "#C24A4F", // 活動部（紅）
  IMA: "#9C4A6E", // 形象宣傳部 / 美宣部（洋紅）
  VP: "#C2A23A", // 副會長（金）
  SEC: "#4E6E6B", // 執秘（復古 petrol 綠）
  MKT: "#5B6E8C", // 行宣部（復古 denim 藍）
  PR: "#A9553F", // 公關部（復古磚紅）
};

// ── 第 52 屆：完整資料（範例＋目前上任屆）─────────────────────
const P52: President = {
  gen: 52,
  name: "曾柏翰",
  roman: "PO-HAN, TSENG",
  cls: "B12",
  img: "", // ← 放入 曾柏翰 的照片路徑（見上方說明）
  intro:
    "第 52 屆系學會由會長曾柏翰領軍，以打造「不一樣的系學會」為核心願景，帶領系學會重新回歸由大三學生擔任會長領導的傳統。任內追求讓同學們更有感於系學會的存在，包含爭取開放學輔室冷氣使用權限、建立學生交流版社群，並為回應系上同學的期望，成功復辦睽違四年的圖資之夜。組織方面，本屆整併公關、行宣、美宣為「形象宣傳部」，並獨立出專責文書財務的「行政部」，同時廣招大一新血使團隊擴充至 40 人規模，期望讓每位圖資人無論能力或天賦，都能在系學會找到屬於自己的一席之地；此外，本屆團隊亦致力於築起學生與教職員之間的橋樑，加強系學會與教授群的緊密連結，爭取更多教授們的參與和指導。",
  depts: [
    {
      en: "GEN",
      zh: "行政部",
      color: C.GEN,
      members: [
        { n: "謝君兒", c: "B13" }, { n: "林榮恩", c: "B14" },
        { n: "羅良鎮", c: "B13" }, { n: "劉以寬", c: "B14" },
        { n: "廖誼晴", c: "B13" }, { n: "賴思瑜", c: "B14" },
      ],
    },
    {
      en: "SP",
      zh: "體育部",
      color: C.SP,
      members: [
        { n: "林洋儀", c: "B13" }, { n: "林聿平", c: "B14" },
        { n: "陳品元", c: "B13" }, { n: "張毓琳", c: "B13" },
        { n: "黃宥甯", c: "B13" },
      ],
    },
    {
      en: "ACA",
      zh: "學術部",
      color: C.ACA,
      members: [
        { n: "黃筱彤", c: "B13" }, { n: "周家禾", c: "B14" },
        { n: "王云佳", c: "B13" }, { n: "許瑞米", c: "B14" },
        { n: "陳姲諭", c: "B13" }, { n: "郭庭妤", c: "B14" },
        { n: "王羽昕", c: "B13" }, { n: "黃詩涵", c: "B14" },
        { n: "蔡依玲", c: "B13" },
      ],
    },
    {
      en: "EVE",
      zh: "活動部",
      color: C.EVE,
      members: [
        { n: "黃子芸", c: "B13" }, { n: "莊雅雯", c: "B14" },
        { n: "王海茵", c: "B13" }, { n: "蕭忻緹", c: "B14" },
        { n: "陳亮昕", c: "B13" }, { n: "呂程琳", c: "B14" },
        { n: "林明霖", c: "B13" }, { n: "彭梓欣", c: "B14" },
        { n: "張瑄予", c: "B14" },
      ],
    },
    {
      en: "IMA",
      zh: "形象宣傳部",
      color: C.IMA,
      members: [
        { n: "王意伶", c: "B13" }, { n: "侯欣妍", c: "B14" },
        { n: "洪聆雅", c: "B13" }, { n: "鄭淳語", c: "B14" },
        { n: "許采芝", c: "B13" }, { n: "葉家米", c: "B14" },
        { n: "林庭妤", c: "B13" }, { n: "張文馨", c: "B14" },
        { n: "張瑋庭", c: "B13" },
      ],
    },
    {
      en: "VP",
      zh: "副會長",
      color: C.VP,
      members: [{ n: "詹凱昕", c: "B12" }],
    },
  ],
};

// 建立「僅有會長基本資料」的一屆（簡介 intro、團隊名單 depts 日後可再補）。
// 任期會由屆數自動推算；系級 cls 取自學號前綴（例：B12106050 → B12）。
// roman＝英文名，格式「GIVEN-NAME, SURNAME」，威妥瑪拼音（與 PO-HAN, TSENG 同式）。
function pres(gen: number, name: string, cls: string, roman: string): President {
  return { gen, name, roman, cls, img: "", intro: "", depts: [] };
}

// ── 第 53 屆（現任）：有會長資料與簡介；團隊名單日後可再補（depts）──
// 副會長洪聆雅（B13, LING-YA, HUNG）已寫入簡介；面板顯示會長黃子芸。
const P53: President = {
  gen: 53,
  name: "黃子芸",
  roman: "TZU-YUN, HUANG",
  cls: "B13",
  img: "", // ← 放入 黃子芸 照片（imports/Presidents/53.jpg，或在此填路徑）
  intro:
    "第 53 屆系學會由會長黃子芸領軍，於 2025 年 7 月 30 日完成交接正式上任。本屆正副會長先前皆曾任第 52 屆系學會幹部，具備實務運作經驗；新團隊期望承接上一屆的基礎，推出讓系上同學更有感的活動與服務，成為圖資系學生大學四年最安心的避風港。本屆除了持續舉辦各種活動、學術講座外，亦會做各大系隊最堅實的後盾，並持續扮演學生、系辦與教師間的溝通橋樑，為系上帶來「看得見」的改變。",
  depts: [],
};

// ── 第 51 屆：完整團隊名單（顏色比照第 52 屆；新部門用復古色）──
const P51: President = {
  gen: 51,
  name: "周芳綺",
  roman: "FANG-CHI, CHOU",
  cls: "B12",
  img: "", // ← 放入 周芳綺 照片（imports/Presidents/51.jpg）
  intro:
    "第 51 屆系學會於任內積極維穩會務運作，並在後期由團隊攜手努力完成交棒。本屆最大亮點為成功復辦睽違三年的系上體育盛事「小圖盃」，重新帶動系上的體育風氣與交流向心力；同時持續維持基礎會務服務，為系學會後續的制度重組與發展奠定基礎。",
  depts: [
    { en: "VP", zh: "副會長", color: C.VP, members: [{ n: "曾柏翰", c: "B12" }] },
    { en: "SEC", zh: "執秘", color: C.SEC, members: [{ n: "王怡婷", c: "B12" }, { n: "洪思涵", c: "B12" }] },
    {
      en: "EVE", zh: "活動部", color: C.EVE, members: [
        { n: "廖士緯", c: "B12" }, { n: "黃聿瑄", c: "B12" }, { n: "黃聖庭", c: "B12" }, { n: "周芳綺", c: "B12" },
        { n: "陳亮昕", c: "B13" }, { n: "張瑋庭", c: "B13" }, { n: "林明霖", c: "B13" }, { n: "林庭妤", c: "B13" }, { n: "王海茵", c: "B13" },
      ],
    },
    {
      en: "ART", zh: "美宣部", color: C.IMA, members: [
        { n: "紀宇烜", c: "B12" }, { n: "陳歆雅", c: "B12" }, { n: "廖育彣", c: "B12" }, { n: "王意伶", c: "B13" }, { n: "許采芝", c: "B13" },
      ],
    },
    { en: "ACA", zh: "學術部", color: C.ACA, members: [{ n: "詹凱昕", c: "B12" }, { n: "蔡宜軒", c: "B12" }, { n: "洪家棚", c: "B13" }] },
    {
      en: "MKT", zh: "行宣部", color: C.MKT, members: [
        { n: "吳佳紜", c: "B12" }, { n: "洪思涵", c: "B12" }, { n: "簡于秦", c: "B12" }, { n: "林明霖", c: "B13" }, { n: "陳亮昕", c: "B13" },
      ],
    },
    { en: "PR", zh: "公關部", color: C.PR, members: [{ n: "曾柏翰", c: "B12" }] },
    { en: "SP", zh: "體育部", color: C.SP, members: [{ n: "曾語衡", c: "B12" }, { n: "黃聖庭", c: "B12" }, { n: "林聿平", c: "B13" }] },
  ],
};

// ── 第 50 屆：完整團隊名單（配色比照第 51/52 屆）──
const P50: President = {
  gen: 50,
  name: "黃裕媞",
  roman: "YU-TI, HUANG",
  cls: "B11",
  img: "", // ← 放入 黃裕媞 照片（imports/Presidents/50.jpg）
  intro:
    "第 50 屆國立臺灣大學圖書資訊學系系學會完整延續並扎根了多項傳統學系活動，包含全校規模的杜鵑花節、傳承職涯經驗的系友講座，以及經典的「圖資週」（該指標性活動於本屆後暫時畫下句點）。本屆由副會長張方瑜協同團隊成員共同推動會務，各部門亦招募多位幹部與大一新血投入協助，確保各項傳統活動與日常服務得以順利完成，為系學會維持了穩定的營運能量。",
  depts: [
    { en: "VP", zh: "副會長", color: C.VP, members: [{ n: "張方瑜", c: "B11" }] },
    { en: "SEC", zh: "執秘", color: C.SEC, members: [{ n: "陳佩玲", c: "B11" }, { n: "黃渝婷", c: "B11" }] },
    {
      en: "EVE", zh: "活動部", color: C.EVE, members: [
        { n: "王可蓁", c: "B11" }, { n: "余品萱", c: "B11" }, { n: "李佳純", c: "B11" }, { n: "蔡怡萱", c: "B11" },
      ],
    },
    {
      en: "ART", zh: "美宣部", color: C.IMA, members: [
        { n: "曹祥真", c: "B11" }, { n: "李亮節", c: "B11" }, { n: "胡羽絜", c: "B11" }, { n: "張方瑜", c: "B11" },
      ],
    },
    {
      en: "ACA", zh: "學術部", color: C.ACA, members: [
        { n: "李南澐", c: "B11" }, { n: "黃奕欣", c: "B11" }, { n: "岑佳恩", c: "B11" }, { n: "蘇亭蓁", c: "B11" },
      ],
    },
    {
      en: "MKT", zh: "行宣部", color: C.MKT, members: [
        { n: "陳昊群", c: "B11" }, { n: "李宏佑", c: "B11" }, { n: "吳優", c: "B11" }, { n: "李亮節", c: "B11" },
      ],
    },
    { en: "PR", zh: "公關部", color: C.PR, members: [{ n: "余品萱", c: "B11" }, { n: "王可蓁", c: "B11" }] },
    { en: "SP", zh: "體育部", color: C.SP, members: [{ n: "李宏佑", c: "B11" }, { n: "陳秉逸", c: "B11" }, { n: "歐益劭", c: "B11" }] },
  ],
};

// ── 第 49 屆：完整團隊名單（配色比照第 50/51/52 屆）──
const P49: President = {
  gen: 49,
  name: "陳子勻",
  roman: "TZU-YUN, CHEN",
  cls: "B10",
  img: "", // ← 放入 陳子勻 照片（imports/Presidents/49.jpg）
  intro:
    "第 49 屆系學會由會長陳子勻領軍，憑藉優秀的領導力與高度凝聚的工作團隊，展現極為高效且和諧的自治能量。本屆極力專注於圖資系本身的定位與推廣，從選課指南到職涯發展皆進行深度的資源整合與輔導，幫助系上同學更清晰地理解學門價值與未來方向，為近年兼具組織執行力與實質服務的團隊之一。",
  depts: [
    { en: "VP", zh: "副會長", color: C.VP, members: [{ n: "歐禹沛", c: "B10" }] },
    { en: "SEC", zh: "執秘", color: C.SEC, members: [{ n: "李冠毅", c: "B10" }, { n: "李政洋", c: "B10" }] },
    {
      en: "EVE", zh: "活動部", color: C.EVE, members: [
        { n: "李政洋", c: "B10" }, { n: "李佳蓁", c: "B10" }, { n: "徐郁瑩", c: "B10" }, { n: "蔡卉婕", c: "B10" },
      ],
    },
    {
      en: "ART", zh: "美宣部", color: C.IMA, members: [
        { n: "黃于庭", c: "B10" }, { n: "詹宇涵", c: "B10" }, { n: "李珮瑤", c: "B10" },
      ],
    },
    {
      en: "ACA", zh: "學術部", color: C.ACA, members: [
        { n: "李孟庭", c: "B10" }, { n: "蔡昀臻", c: "B10" }, { n: "江秝槿", c: "B10" },
      ],
    },
    {
      en: "MKT", zh: "行宣部", color: C.MKT, members: [
        { n: "林柏鋮", c: "B10" }, { n: "許郁婕", c: "B10" }, { n: "王胤勳", c: "B10" },
      ],
    },
    { en: "PR", zh: "公關部", color: C.PR, members: [{ n: "歐禹沛", c: "B10" }, { n: "張豊婕", c: "B10" }] },
    { en: "SP", zh: "體育部", color: C.SP, members: [{ n: "江秝槿", c: "B10" }, { n: "李昱瑨", c: "B10" }] },
  ],
};

// ── 第 48 屆：完整團隊名單＋簡介（配色比照第 49~52 屆）──
const P48: President = {
  gen: 48,
  name: "陳亨柔",
  roman: "HENG-JOU, CHEN",
  cls: "B09",
  img: "", // ← 放入 陳亨柔 照片（imports/Presidents/48.jpg）
  intro:
    "第 48 屆系學會由會長陳亨柔帶領，正值疫情後百廢待興的關鍵時刻，團隊積極推動系務復甦，首要任務即為重啟並整理學輔室，重新為系上同學打造一處能夠舒適休息、討論與讀書的自治空間。在學術與職涯發展上，本屆同樣專注於圖資系本身的定位推廣，針對選課策略與職涯探索提供系統化的整理與指引，協助同學釐清學習方向；同時，團隊亦舉辦了「2022 圖資之夜」、系烤等多項精彩活動，不僅在學業上給予實質協助，也在後疫情時代為系上重新注入熱絡的活力與向心力。",
  depts: [
    { en: "VP", zh: "副會長", color: C.VP, members: [{ n: "廖庭儀", c: "B09" }] },
    { en: "SEC", zh: "執秘", color: C.SEC, members: [{ n: "高子涵", c: "B09" }, { n: "李沚庭", c: "B09" }] },
    {
      en: "EVE", zh: "活動部", color: C.EVE, members: [
        { n: "劉蕙聿", c: "B09" }, { n: "溫品淳", c: "B09" }, { n: "何幸佳", c: "B09" },
      ],
    },
    {
      en: "ART", zh: "美宣部", color: C.IMA, members: [
        { n: "陳南心", c: "B09" }, { n: "李佳耘", c: "B09" }, { n: "蔡沐學", c: "B09" },
      ],
    },
    {
      en: "ACA", zh: "學術部", color: C.ACA, members: [
        { n: "邱裕安", c: "B09" }, { n: "賴靖甯", c: "B09" }, { n: "鄭美馨", c: "B09" },
      ],
    },
    { en: "MKT", zh: "行宣部", color: C.MKT, members: [{ n: "張亦涵", c: "B09" }, { n: "陳奕妏", c: "B09" }] },
    {
      en: "PR", zh: "公關部", color: C.PR, members: [
        { n: "何昱穎", c: "B09" }, { n: "史亦君", c: "B09" }, { n: "梁瑀籈", c: "B09" },
      ],
    },
    { en: "SP", zh: "體育部", color: C.SP, members: [{ n: "張瀚元", c: "B09" }, { n: "方乃慎", c: "B09" }] },
  ],
};

// ── 全部屆數（新 → 舊）。學年 115＝第 53 屆（現任），學年 114＝第 52 屆，往前每學年一屆，學年 94＝第 32 屆。──
// 第 53 屆＝民國115~116（2026.07~2027.07）；第 52 屆＝民國114~115（2025.07~2026.07）；第 32 屆＝民國94~95（2005.07~2006.07）。
// 頁面預設顯示陣列第一個（＝現任第 53 屆）。想補簡介/團隊名單：把該屆改成完整物件（可參考 P52 的寫法）。
export const PRESIDENTS: President[] = [
  P53, //                                        學年115 · 會長 黃子芸（現任）· 副會長 洪聆雅
  P52, //                                        學年114 · 會長 曾柏翰 · B12106050
  P51, //                                        學年113 · 社長 周芳綺 · B12106038（含完整團隊名單）
  P50, //                                        學年112 · 社長 黃裕媞 · B11106020（含完整團隊名單）
  P49, //                                        學年111 · 會長 陳子勻 · B10106046（含完整團隊名單）
  P48, //                                        學年110 · 會長 陳亨柔 · B09106011（含完整團隊名單＋簡介）
  pres(47, "方沛樺", "B08", "PEI-HUA, FANG"), //  學年109 · 會長 · B08106010
  pres(46, "周示嚴", "B07", "SHIH-YEN, CHOU"), // 學年108 · 會長 · B07106010
  pres(45, "劉卉馨", "B06", "HUI-HSIN, LIU"), //  學年107 · 會長 · B06106023
  pres(44, "黃傲天", "B05", "AO-TIEN, HUANG"), // 學年106 · 會長 · B05106008
  pres(43, "史修竹", "B02", "HSIU-CHU, SHIH"), // 學年105 · 會長 · B02106009
  pres(42, "楊宜瑄", "B02", "YI-HSUAN, YANG"), // 學年104 · 會長 · B02106004
  pres(41, "邱祥兒", "B01", "HSIANG-ERH, CHIU"), // 學年103 · 會長 · B01106032
  pres(40, "王泓琦", "B00", "HUNG-CHI, WANG"), // 學年102 · 會長 · B00106003
  pres(39, "王翊宇", "B99", "YI-YU, WANG"), //    學年101 · 會長 · B99106043
  pres(38, "馬中哲", "B98", "CHUNG-CHE, MA"), //  學年100 · 會長 · B98106007
  pres(37, "楊舒涵", "B97", "SHU-HAN, YANG"), //  學年99 · 會長 · B97106038
  pres(36, "張震權", "B96", "CHEN-CHUAN, CHANG"), // 學年98 · 會長 · B96106031
  pres(35, "鄭艾妮", "B95", "AI-NI, CHENG"), //   學年97 · 會長 · B95106002
  pres(34, "毛昱惟", "B94", "YU-WEI, MAO"), //    學年96 · 會長 · B94106009
  pres(33, "蔡宗翰", "B93", "TSUNG-HAN, TSAI"), // 學年95 · 會長 · B93106020
  pres(32, "孫亭芳", "B92", "TING-FANG, SUN"), // 學年94 · 社長 · B92106027
];

// 現任屆＝陣列第一個（最新）。任期由屆數推算（第52屆＝2025.07~2026.07；每屆一年）；
// 現任這屆結束改顯示「至今」，讓使用者一眼看出是新上任、任期進行中的會長。
const CURRENT_GEN = PRESIDENTS[0]?.gen;
function termOf(gen: number) {
  const start = gen + 1973; // 52 -> 2025
  if (gen === CURRENT_GEN) return `${start}.07 ～ 至今`;
  return `${start}.07 ～ ${start + 1}.07`;
}

/* ── 會長照片：自動對應 ──────────────────────────────────────
   把照片放到  imports/Presidents/  資料夾，檔名＝屆數（如 52.jpg、51.png）。
   之後只要「丟檔案進資料夾」就會自動顯示，程式不用再改；上方每屆的 img 可留空字串。
   （若某屆想手動指定別的圖，仍可在該屆物件的 img 直接填路徑，會優先採用。）
   註：import.meta.glob 為 Vite 功能；若 @/ 別名在此不生效，
       把路徑改成相對路徑 "../../../imports/Presidents/*.{png,jpg,jpeg,webp}" 即可。 */
const PHOTOS = import.meta.glob(
  "@/imports/Presidents/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;

function photoOf(gen: number): string {
  const hit = Object.entries(PHOTOS).find(([path]) => path.includes(`/${gen}.`));
  return hit ? hit[1] : "";
}

// ── 屆數切換器上的「點 → 箭頭」按鈕 ─────────────────────────
function NavArrow({
  dir,
  color,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  color: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "上一屆（較早）" : "下一屆（較新）"}
      className="group relative flex items-center justify-center disabled:cursor-default"
      style={{ width: "46px", height: "46px" }}
    >
      {disabled ? (
        // 已達最舊/最新：靜態暗點，不脈動、不出現箭頭
        <span className="absolute rounded-full" style={{ width: "11px", height: "11px", background: color, opacity: 0.18 }} />
      ) : (
        <>
          {/* 平常：持續脈動的同色光暈 + 核心圓點（提示「可點擊」）；hover 時整組淡出 */}
          <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out group-hover:opacity-0">
            <span className="nav-pulse-halo absolute rounded-full" style={{ width: "22px", height: "22px", background: color, filter: "blur(5px)" }} />
            <span className="nav-pulse-dot absolute rounded-full" style={{ width: "11px", height: "11px", background: color }} />
          </span>
          {/* hover：放大成圓形箭頭按鈕 */}
          <span
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 scale-75 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100"
            style={{ background: color, boxShadow: `0 8px 20px -8px ${color}` }}
          >
            <Icon size={22} strokeWidth={2.6} className="text-white" />
          </span>
        </>
      )}
    </button>
  );
}

// ── 單一部門卡片 ───────────────────────────────────────────
function DeptCard({ dept }: { dept: Dept }) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5"
      style={{ borderColor: dept.color, background: "rgba(255,255,255,0.02)" }}
    >
      <p className="mb-4 whitespace-nowrap" style={{ fontFamily: monoFont, fontWeight: 700, fontSize: "clamp(0.68rem,0.9vw,0.85rem)", letterSpacing: "0.12em" }}>
        <span style={{ color: dept.color }}>{dept.en}.</span>{" "}
        <span className="text-white/85">{dept.zh}</span>
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
        {dept.members.map((m, i) => (
          <div key={`${m.n}-${i}`} className="flex items-center gap-2 min-w-0">
            <span
              className="shrink-0 text-white/70 rounded-[4px] px-1.5 py-0.5"
              style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "0.6rem", background: "rgba(255,255,255,0.12)", letterSpacing: "0.04em" }}
            >
              {m.c}
            </span>
            <span className="text-white truncate" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.8rem,1vw,0.95rem)", letterSpacing: "0.08em" }}>
              {m.n}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 把部門依「估算高度」分成左右兩欄（保留原順序）。左欄先填、且高度 ≥ 右欄，
// 讓兩欄各自向下緊貼堆疊、不會因整列對齊而在中間留空；剩餘空白只落在右下角。
function splitTwoColumns(depts: Dept[]): [Dept[], Dept[]] {
  const weight = (d: Dept) => 1 + Math.ceil(d.members.length / 2); // 標題列 + 名單列數
  const half = depts.reduce((s, d) => s + weight(d), 0) / 2;
  const left: Dept[] = [];
  const right: Dept[] = [];
  let acc = 0;
  for (const d of depts) {
    if (acc < half) {
      left.push(d);
      acc += weight(d);
    } else {
      right.push(d);
    }
  }
  return [left, right];
}

// ── 會長照片：交叉淡入舞台 ─────────────────────────────────
// 切換屆時，新照片淡入、舊照片淡出（cross-dissolve），而非硬切；配合下方預先載入避免卡頓。
const PHOTO_H = "clamp(280px, 50vh, 560px)"; // 照片區高度（與姓名/屆數的固定位置對齊）

// 照片底部漸層遮罩：讓每張會長照片的下緣淡出、像漂浮融進黑背景，而非硬切一條黑邊。
// 想讓淡出範圍更多→把 72% 調小（例如 60%，淡出下方 40%）；想更少→調大（例如 82%）。
const PHOTO_FADE = "linear-gradient(to bottom, #000 72%, transparent 100%)";

function renderPhoto(src: string, name: string) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="absolute inset-0 w-full h-full object-contain object-top select-none pointer-events-none"
        style={{ WebkitMaskImage: PHOTO_FADE, maskImage: PHOTO_FADE }}
      />
    );
  }
  // 沒有照片：置中「照片待補」佔位框
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="flex flex-col items-center justify-center gap-3 text-white/25 rounded-2xl border border-white/10"
        style={{ height: "100%", width: "clamp(220px, 26vw, 380px)", fontFamily: monoFont, letterSpacing: "0.2em" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-16 h-16">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
        </svg>
        <span className="text-xs">照片待補</span>
      </div>
    </div>
  );
}

function PhotoStage({ src, name }: { src: string; name: string }) {
  const keyRef = useRef(0);
  const [layers, setLayers] = useState<{ k: number; src: string }[]>([{ k: 0, src }]);
  const removeTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 真正把新照片疊上來、開始交叉溶解（舊層在 650ms 後移除）
    const commit = () => {
      if (cancelled) return;
      setLayers((cur) => {
        const top = cur[cur.length - 1];
        if (top && top.src === src) return cur; // 沒變就不動作
        keyRef.current += 1;
        return [...cur, { k: keyRef.current, src }].slice(-2); // 僅保留「舊 + 新」兩層
      });
      if (removeTimer.current) window.clearTimeout(removeTimer.current);
      removeTimer.current = window.setTimeout(() => setLayers((cur) => cur.slice(-1)), 650);
    };

    // 先「等新照片解碼完成」再開始動畫：舊照片撐著不移除，避免出現全黑空檔，
    // 讓每一屆的切換都跟已快取的近幾屆一樣是平順的交叉溶解（而非黑→淡入）。
    if (!src) {
      commit(); // 佔位框沒有圖片，直接切
    } else if (typeof window !== "undefined") {
      const img = new window.Image();
      img.src = src;
      if (img.decode) {
        img.decode().then(commit).catch(commit); // 解碼好或失敗都照常切
      } else if (img.complete) {
        commit();
      } else {
        img.onload = commit;
        img.onerror = commit;
      }
    } else {
      commit();
    }

    return () => { cancelled = true; };
  }, [src]);

  return (
    <div className="relative w-full" style={{ height: PHOTO_H }}>
      {layers.map((layer, i) => (
        <div key={layer.k} className={i === layers.length - 1 ? "pp-photo-in" : "pp-photo-out"} style={{ position: "absolute", inset: 0 }}>
          {renderPhoto(layer.src, name)}
        </div>
      ))}
    </div>
  );
}

// ── 右半：會長個人資訊面板（照片 → 姓名/系級 → 英文名 → 屆數切換器，全部置中）──
// 桌機以 fixed 釘在右半、永遠顯示；手機則靜態顯示於頁面上方。
function ProfilePanel({
  name,
  cls,
  roman,
  gen,
  photo,
  canOlder,
  canNewer,
  onOlder,
  onNewer,
}: {
  name: string;
  cls: string;
  roman: string;
  gen: number;
  photo: string;
  canOlder: boolean;
  canNewer: boolean;
  onOlder: () => void;
  onNewer: () => void;
}) {
  return (
    // 固定頂端對齊（justify-start + 固定 pt）：照片、姓名、屆數在每一屆都落在同一垂直位置，換屆不位移。
    <div className="w-full h-full flex flex-col items-center justify-start text-center px-6 sm:px-10 pt-24 lg:pt-[112px] pb-16">
      {/* 會長照片（交叉淡入；縮小、完整顯示人物；頭頂大致與左側 ABOUT US 齊高）*/}
      <PhotoStage src={photo} name={name} />

      {/* 姓名 + 系級徽章（置中） */}
      <div className="flex items-end justify-center gap-3 mt-7">
        <p className="text-white leading-none" style={{ fontFamily: zhDisplay, fontWeight: 900, fontSize: "clamp(2.2rem,4vw,3.6rem)", letterSpacing: "0.08em" }}>
          {name}
        </p>
        {cls && (
          <span
            className="mb-1.5 rounded-[6px] px-3 py-1"
            style={{ background: "linear-gradient(90deg,#FFF 0%,#B3B3B3 100%)", color: "#000", fontFamily: monoFont, fontWeight: 700, fontSize: "clamp(0.85rem,1.2vw,1.15rem)", letterSpacing: "0.06em" }}
          >
            {cls}
          </span>
        )}
      </div>

      {/* 英文名（置中，兩側細線） */}
      {roman && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="h-px w-8 sm:w-12" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5))" }} />
          <span style={{ fontFamily: monoFont, fontWeight: 400, fontSize: "clamp(0.72rem,1vw,0.95rem)", letterSpacing: "0.22em", background: "linear-gradient(90deg,#FFF 0%,#8f8f8f 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>
            {roman}
          </span>
          <span className="h-px w-8 sm:w-12" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.5), transparent)" }} />
        </div>
      )}

      {/* 屆數切換器：•  52  •（置中） */}
      <div className="flex items-center justify-center gap-5 sm:gap-7 mt-8">
        <NavArrow dir="prev" color="#D14B4B" disabled={!canOlder} onClick={onOlder} />
        <span
          className="tabular-nums leading-none select-none"
          style={{
            fontFamily: monoFont,
            fontWeight: 700,
            fontSize: "clamp(2.4rem,4.5vw,4rem)",
            letterSpacing: "0.06em",
            background: "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {gen}
        </span>
        <NavArrow dir="next" color="#2F9EBD" disabled={!canNewer} onClick={onNewer} />
      </div>
    </div>
  );
}

export default function PastPresidentsSection() {
  const [idx, setIdx] = useState(0); // 0 = 最新一屆（陣列第一個）
  const p = PRESIDENTS[idx] ?? PRESIDENTS[0];
  const hasData = p.name.trim() !== "";
  const photo = p.img || photoOf(p.gen); // 先看該屆有沒有手動指定，沒有就依屆數自動找

  // 陣列是「新→舊」：往前一屆（較早）＝ index+1；往後一屆（較新）＝ index-1。
  const canOlder = idx < PRESIDENTS.length - 1;
  const canNewer = idx > 0;

  // 切換屆時「不」捲回頂端：讓使用者停在同一位置，例如正在看團隊名單時可直接比較另一屆的名單。
  const goOlder = () => { if (canOlder) setIdx((v) => v + 1); };
  const goNewer = () => { if (canNewer) setIdx((v) => v - 1); };

  // 預先載入所有會長照片，切換時就不會有載入卡頓（配合照片的淡入動畫）。
  useEffect(() => {
    if (typeof window === "undefined") return;
    PRESIDENTS.forEach((pp) => {
      const s = pp.img || photoOf(pp.gen);
      if (s) {
        const im = new window.Image();
        im.src = s;
      }
    });
  }, []);

  const [deptLeft, deptRight] = splitTwoColumns(p.depts); // 團隊名單分成左右兩欄（避免整列對齊留空）

  const panel = (
    <ProfilePanel
      name={hasData ? p.name : "—"}
      cls={hasData ? p.cls : ""}
      roman={hasData ? p.roman : ""}
      gen={p.gen}
      photo={photo}
      canOlder={canOlder}
      canNewer={canNewer}
      onOlder={goOlder}
      onNewer={goNewer}
    />
  );

  return (
    <section id="presidents" className="relative bg-black">
      {/* 屆數切換按鈕的「呼吸式」脈動動畫（提示可點擊）；尊重使用者的「減少動態」設定 */}
      <style>{`
        @keyframes navPulseHalo {
          0%, 100% { transform: scale(0.65); opacity: 0.55; }
          50%      { transform: scale(1.6);  opacity: 0.06; }
        }
        @keyframes navPulseDot {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.22); }
        }
        .nav-pulse-halo { transform-origin: center; animation: navPulseHalo 1.8s ease-in-out infinite; }
        .nav-pulse-dot  { transform-origin: center; animation: navPulseDot 1.8s ease-in-out infinite; }

        /* 會長照片切換：新照片淡入（略微上浮），舊照片淡出 */
        @keyframes ppPhotoIn  { from { opacity: 0; transform: translateY(10px) scale(0.985); } to { opacity: 1; transform: none; } }
        @keyframes ppPhotoOut { from { opacity: 1; } to { opacity: 0; } }
        .pp-photo-in  { animation: ppPhotoIn 600ms cubic-bezier(0.22,1,0.36,1) both; }
        .pp-photo-out { animation: ppPhotoOut 600ms ease both; }

        @media (prefers-reduced-motion: reduce) {
          .nav-pulse-halo, .nav-pulse-dot { animation: none; }
          .pp-photo-in, .pp-photo-out { animation-duration: 1ms; }
        }
      `}</style>
      {/* ══════════ 右半：桌機用 fixed 永遠釘在原地（不受左半捲動影響）══════════
          用 fixed 而非 sticky，是因為 App 根層有 overflow-x-hidden 會讓 sticky 失效。
          z-10：讓固定的 Header(z-50) 疊在照片上方；捲到底時 Footer 會蓋過它（Footer 已設 relative z-30）。 */}
      <div className="hidden lg:block fixed top-0 right-0 w-1/2 h-screen z-10">
        {panel}
      </div>

      {/* ══════════ 手機：會長資訊顯示在最上方（靜態）══════════ */}
      <div className="lg:hidden min-h-[82vh] border-b border-white/5">{panel}</div>

      {/* ══════════ 左半：可捲動（右半空間由上面的 fixed 面板佔用）══════════ */}
      <div className="w-full lg:w-1/2 px-5 sm:px-8 md:px-12 lg:px-16">
        {/* 第一屏：標題 + 第X屆 + 任期 + 簡介
            用「固定頂端對齊」而非置中：標題/任期永遠釘在同一位置，換屆時不會因簡介長短而位移。
            lg:min-h-screen 仍讓「團隊成員」落到第二屏，需下滑才看到。 */}
        <div className="lg:min-h-screen pt-24 sm:pt-28 lg:pt-[128px] pb-16 lg:pb-24">
          <div className="max-w-[640px]">
            <Reveal>
              <p className="text-white/30 text-xs tracking-widest mb-5" style={{ fontFamily: monoFont }}>
                — ABOUT US 關於我們
              </p>
            </Reveal>
            <Reveal delay={40}>
              <h2 className="font-bold leading-none mb-8 lg:mb-10" style={{ fontFamily: enDisplay, fontSize: "clamp(2.6rem,5vw,5rem)" }}>
                <span className="text-white block">PAST</span>
                <span className="block" style={{ color: "#D14B4B" }}>PRESIDENTS</span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <h3
                className="leading-tight mb-3"
                style={{
                  fontFamily: zhDisplay,
                  fontWeight: 900,
                  fontSize: "clamp(1.8rem,3.4vw,3rem)",
                  letterSpacing: "0.06em",
                  background: "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                第 {p.gen} 屆系學會
              </h3>
              <p className="text-white/50 mb-8 lg:mb-10" style={{ fontFamily: monoFont, fontWeight: 500, fontSize: "clamp(0.8rem,1vw,1rem)", letterSpacing: "0.14em" }}>
                任期：{termOf(p.gen)}
              </p>
            </Reveal>

            <Reveal delay={120}>
              <p
                style={{
                  fontFamily: zhFont,
                  fontWeight: 500,
                  fontSize: "clamp(0.85rem,1vw,1rem)",
                  lineHeight: 2.1,
                  letterSpacing: "0.06em",
                  color: p.intro ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.4)",
                }}
              >
                {p.intro ? p.intro : "本屆簡介整理中，敬請期待。"}
              </p>
            </Reveal>
          </div>
        </div>

        {/* 第二屏起：團隊成員（lg:min-h-screen 讓成員自成一屏，右側面板在瀏覽名單時保持完整顯示）*/}
        {p.depts.length > 0 && (
          <div className="max-w-[720px] pb-20 lg:pb-28 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
            {/* key 帶上屆數：切屆時整個團隊區重新掛載，讓進場動畫每次都重播（比照第一次看 52 屆） */}
            <Reveal key={`pill-${p.gen}`}>
              <div
                className="inline-flex rounded-full mb-8 lg:mb-10"
                style={{ padding: "1.5px", background: "linear-gradient(90deg, #D14B4B 0%, #2F9EBD 100%)" }}
              >
                <div className="rounded-full bg-black px-6 py-2">
                  <span className="text-white" style={{ fontFamily: zhFont, fontWeight: 700, fontSize: "clamp(0.9rem,1.1vw,1.05rem)", letterSpacing: "0.24em", paddingLeft: "0.24em" }}>
                    團隊成員
                  </span>
                </div>
              </div>
            </Reveal>

            {/* 兩欄各自向下緊貼堆疊（masonry 式）：卡片不會因整列對齊而在中間留空，
                剩餘空白只會落在較短那欄（右欄）的最底＝右下角。 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
              <div className="flex flex-col gap-3 sm:gap-4">
                {deptLeft.map((d, i) => (
                  <Reveal key={`${p.gen}-${d.en}`} delay={i * 50}>
                    <DeptCard dept={d} />
                  </Reveal>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:gap-4">
                {deptRight.map((d, i) => (
                  <Reveal key={`${p.gen}-${d.en}`} delay={(deptLeft.length + i) * 50}>
                    <DeptCard dept={d} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}