// ════════════════════════════════════════════════════════════════
// 各種服務 · 資料檔（單一資料來源 Single Source of Truth）
// ────────────────────────────────────────────────────────────────
// ★ 這個檔同時餵養兩個頁面：
//     1) Services.tsx        → #/services 的 Bento 總覽 + #/service/<slug> 詳情頁（右側翻牌卡）
//     2) about-us/Department.tsx  → #/dept/<slug> 右側「服務輪播」（用 servicesByDept 撈同一份資料）
//   任何一項業務的名稱／連結／介紹／指引，改這裡一次，兩個頁面同時更新。
//
//   type:"dept"    部門名稱格（填滿部門色 + 顯示 imports/services/<dept>.svg）
//   type:"service" 業務格（外框部門色、hover 才填色；點擊進 #/service/<slug>）
//   佈局：12 欄 × 8 列；gc/gr = CSS grid-column / grid-row 字串，例："3 / span 3"
//   vertical:true  = 直排文字（窄長格用；只影響 Bento 呈現）
//
//   詳情頁 / 輪播共用欄位：
//     en        英文標題（大寫裝飾字，中英文版都會顯示）
//     intro     介紹內文
//     href      相關網址（外部表單或站內 #/xxx）；沒填＝詳情頁顯示「準備中」膠囊
//     dest      「前往」按鈕的目的地說明（如「購書表單」「Instagram 個人檔案」）；
//               滑鼠移到「前往」上時，會從按鈕背後往右滑出。只有填了 href 的服務才需要；
//               有 href 但不想顯示就填 false。
//     note      便利貼：不想要就填 false（或省略）；填字串才會顯示
//     guide     詳情頁右側「翻牌卡」背面的服務指引（字串陣列，一項一點）；
//               沒填＝卡片不顯示右上角「i」翻牌鈕，只當純圖卡。
//     fit/pos/scale/fade  部門頁輪播單張圖的顯示微調（可全省，省略吃 Department 的 SERVICE_IMG 預設）
//     hideInDept 填 true＝只出現在 Bento 總覽，不進該部門頁的輪播
//
//   英文版欄位（切換到 EN 時顯示；都可省略，省略＝英文版先顯示中文）：
//     nameEn    服務名稱（取代 zh）
//     introEn   介紹內文
//     noteEn    便利貼文字
//     destEn    「前往」目的地說明
//     guideEn   服務指引（字串陣列）
//   ★ 畫面上請用 localizeService(服務, lang) 取得「目前語言版本」的資料。
//
//   圖片：以 slug 命名放 imports/services/（如 locker.png）。
//         Bento 詳情頁與部門頁輪播共用同一張（詳情頁靠檔名=slug 自動找；輪播靠 svcImg(slug)）。
// ════════════════════════════════════════════════════════════════

import type { Lang } from "../i18n";

export type Dept = "gen" | "eve" | "aca" | "ima" | "sp";

const airconGuidePdf = new URL(
  "../../imports/services/IMG-gen/學輔室冷氣使用規範.pdf",
  import.meta.url,
).href;

// 五個部門色（Bento 格線色、詳情頁背景色都吃這裡）— 你的正式色票
export const DEPT_COLORS: Record<Dept, string> = {
  gen: "#915E3E", // 行政（棕）
  eve: "#9F353A", // 活動（紅）
  aca: "#42602D", // 學術（綠）
  ima: "#572A3F", // 美宣（紫）
  sp:  "#23658A", // 體育（藍）
};

// 五個部門的名稱（中英）
export const DEPT_NAMES: Record<Dept, { zh: string; en: string }> = {
  gen: { zh: "行政部", en: "General Affairs" },
  eve: { zh: "活動部", en: "Events" },
  aca: { zh: "學術部", en: "Academic Affairs" },
  ima: { zh: "形象宣傳部", en: "Image & Publicity" },
  sp:  { zh: "體育部", en: "Sports" },
};

export type Cell =
  | { type: "dept"; dept: Dept; gc: string; gr: string }
  | {
      type: "service"; dept: Dept; slug: string; zh: string; gc: string; gr: string;
      vertical?: boolean; en: string; intro: string; href?: string;
      // dest 前往目的地說明：hover「前往」時往右滑出；不想顯示填 false。只有有 href 的服務需要。
      dest?: string | false;
      // note 便利貼：不想要就填 false（或直接省略）；填字串才會顯示。
      note?: string | false;
      // guide 翻牌卡背面的服務指引：一項一點；沒填＝不顯示「i」翻牌鈕。
      guide?: string[];
      // ── 英文版（可省略）──
      nameEn?: string;
      introEn?: string;
      noteEn?: string | false;
      destEn?: string | false;
      guideEn?: string[];
      // ── 以下是「部門頁輪播」也會用到的欄位（Bento 總覽用不到，可留空）──
      fit?: "contain" | "cover";      // 單張圖顯示方式（省略吃全域預設 contain）
      pos?: string;                   // object-position，如 "center" / "top" / "50% 30%"
      scale?: number;                 // 縮放倍率，1＝原樣；圖偏小可設 1.15
      fade?: boolean;                 // 是否套底部漸層；省略＝只有 cover 才淡出
      hideInDept?: boolean;           // true＝只在 Bento 出現、不進該部門頁輪播
    };

// 業務格排在 servicesByDept 回傳時的順序 = 下面 BENTO 的排列順序；
// 想改「部門頁輪播的先後」，直接在這裡調同部門那幾格的上下順序即可。
export const BENTO: Cell[] = [
  // ── 部門名稱格（填色 + svg）──
  { type: "dept", dept: "gen", gc: "1 / span 2", gr: "1 / span 1" },
  { type: "dept", dept: "eve", gc: "6", gr: "1 / span 2" },
  { type: "dept", dept: "aca", gc: "1", gr: "7 / span 2" },
  { type: "dept", dept: "ima", gc: "8 / span 2", gr: "5 / span 1" },
  { type: "dept", dept: "sp", gc: "12", gr: "7 / span 2" },

  // ══ gen 行政（棕） ══
  // 系學會費
  {
    type: "service", dept: "gen", slug: "fee-lissa", zh: "系學會費",
    nameEn: "Membership Fee",
    gc: "1", gr: "2 / span 3", vertical: true,
    en: "FEE LISSA",
    intro:
      "繳納系學會費不僅是對系上運作的支持，更是伴隨你四年大學生活最超值的專屬投資！有繳費的系胞立即享有「五大核心權益」：迎新活動直接免費參加、系館專屬系櫃享免租金借用、學術部嚴選教科書享有更便宜的團購專屬優惠價、系服訂購享有減免折扣，以及系烤、舞會等整年度各大精彩活動的專屬報名優惠價；一份會費直接解鎖學習置物、課業購書到社交娛樂的全方位福利，陪伴你用最划算、充實的方式度過整個圖資大學生活！",
    introEn:
      "Paying the membership fee supports the association — and it's the best-value investment of your four years at university! Members instantly unlock five core benefits: free entry to the welcome party, a free department locker, discounted group prices on textbooks, a discount on the department hoodie, and member prices for the BBQ, the Christmas Ball and every major event of the year. One fee covers everything from storage and textbooks to your social life.",
    note: "繳費即享五大優惠",
    noteEn: "5 member benefits",
    href: "#/fees",
    dest: "系學會費說明",
    destEn: "Membership details",
  },

  // 系櫃租借
  {
    type: "service", dept: "gen", slug: "locker", zh: "系櫃租借",
    nameEn: "Locker Rental",
    gc: "2", gr: "2 / span 3", vertical: true,
    en: "LOCKER RENTAL",
    intro:
      "每天往返系館總是被厚重的原文書、筆電與雜物壓得喘不過氣嗎？系學會於每學年提供「系櫃租借服務」，為系上同學打造專屬且安全的置物空間；無論是課業教材、雨具或私人物品，都能妥善收納在系館內，讓你省去每日奔波揹負重物的負擔，課堂空檔也能輕裝穿梭於校園之間，用最輕鬆優雅的步調享受充實的大學生活！",
    introEn:
      "Tired of hauling heavy textbooks, your laptop and everything else to the department every day? Each academic year the association offers lockers in the department building — a safe place for course materials, umbrellas and personal items, so you can move around campus light between classes.",
    note: "數量有限",
    noteEn: "Limited supply",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSfmwqzlNfrtShLDTGdOBX2NuIT-NDs3Z49nJHVlLnPXcYlJ6g/viewform?usp=header",
    dest: "系櫃租借表單",
    destEn: "Locker rental form",
    guide: [
      "系櫃租借服務每學年開放，若有需要請填寫系櫃租借表單",
      "繳納系學會費者可免租金（酌收鑰匙押金 200 元",
      "未繳系學會費者：一學年租金 $400 元 ＋ 鑰匙押金 $200 元",
      "完成租借申請後即可向系學會夥伴領取鑰匙",

    ],
    guideEn: [
      "Lockers open every academic year — fill in the locker rental form if you need one",
      "Members rent for free (NT$200 key deposit only)",
      "Non-members: NT$400 per academic year + NT$200 key deposit",
      "After applying, pick up your key from an association member",
    ],
  },

  // 學輔室夜間使用
  {
    type: "service", dept: "gen", slug: "lounge", zh: "學輔室夜間使用",
    nameEn: "Lounge Night Use",
    gc: "3 / span 3", gr: "1 / span 2",
    en: "LOUNGE NIGHT USE",
    intro:
      "為了讓需要自習、討論報告或準備專案的同學擁有更彈性的空間，系學會特別推出貼心的「學輔室延後使用申請」服務；依系辦規定，系館平時超過晚間 19:00 即需離館，若系上同學在期中週、期末週有晚間延長使用的正當需求，系學會將扮演溝通橋樑，統一協助大家向系辦提出留館與學輔室延後使用的申請手續，省去個人繁瑣的行政流程，全力支援大家的課業與專案進度，讓你在熟悉的系館空間裡安心衝刺無後顧之憂！",
    introEn:
      "Need somewhere to study, work on a group report or finish a project? Under department rules, everyone must leave the building after 7 p.m. During midterm and final exam weeks, the association applies to the department office on your behalf for extended evening use of the student lounge — no paperwork for you, just a familiar space to focus.",
    note: "線上預約",
    noteEn: "Book online",
    href: "https://stitch-antler-b46.notion.site/17353c4e8df1837b835381775fff75a5",
    dest: "學輔室夜間預約表單",
    destEn: "Lounge booking form",
    guide: [
      "開放時間：期中考、期末考週前一週、當週（週一至週五，晚間 19:00～22:00）",
      "學輔室夜間申請僅開放「有繳交系學會費者」申請",
      "未繳交會費者：可作為組員一起使用，但需由已繳費會員擔任主要申請人",
      "請於使用日前一天中午 12:00 前完成申請",
    ],
    guideEn: [
      "Available the week before and during midterm and final exams (Mon–Fri, 7–10 p.m.)",
      "Only members can apply for night use",
      "Non-members may join a group, but a member must be the main applicant",
      "Apply by 12:00 noon the day before",
    ],
  },

  // 學輔室冷氣使用
  {
    type: "service", dept: "gen", slug: "aircon", zh: "學輔室冷氣使用",
    nameEn: "Lounge Air-Con",
    gc: "3 / span 3", gr: "3 / span 2",
    en: "LOUNGE AIR-CON",
    intro:
      "自第 52 屆系學會起正式開放學輔室冷氣讓大家使用，希望為系胞打造一個清涼舒適的自習與討論空間；但享受福利的同時也需要大家共同守護，冷氣運轉期間請隨手關門並上鎖其中一扇以防被風吹開，使用完畢務必主動關閉電源並將遙控器放回原位，若未遵守規範將考慮暫停開放以示警告，美好的共享資源有賴全體同學共同維持，感謝大家的配合！",
    introEn:
      "Since the 52nd association, the lounge air conditioning has been open to everyone for a cool, comfortable place to study and meet. Please help look after it: keep the door closed (lock one side so it doesn't blow open), switch the unit off and return the remote when you leave. If the rules aren't followed, access may be suspended — thanks for your cooperation!",
    note: false,
    href: airconGuidePdf,
    dest: "冷氣使用規範",
    destEn: "Air-con rules (PDF, Chinese)",
    guide: [
      "學輔室開放時間內可以自由使用",
      "請務必在離開學輔室前確認冷氣已關閉，並將遙控器放回原位",
      "更多規定請詳見冷氣使用規範",
    ],
    guideEn: [
      "Free to use during lounge opening hours",
      "Before leaving, make sure the air-con is off and the remote is back in place",
      "See the air-con rules for details",
    ],
  },

  // ══ eve 活動（紅） ══
  // 圖資之夜
  {
    type: "service", dept: "eve", slug: "lis-night", zh: "圖資之夜",
    nameEn: "LIS Night",
    gc: "7 / span 2", gr: "1 / span 2",
    en: "LIS NIGHT",
    intro:
      "自去年盛大復辦的「圖資之夜」，就是屬於全體圖資人最耀眼、最毫無保留釋放才華的專屬舞台！這一天我們徹底打破刻板印象——圖資人不低調，我們用熱力四射的舞蹈、動人心弦的歌聲、創意滿點的戲劇與精彩絕倫的跨界演出震撼全場；聚光燈亮起，掌聲與尖叫聲交織，「LISSA, on LIVE」，邀你一起走進這場視聽盛宴，見證每一位圖資人在舞台上發光發熱的極致魅力！",
    introEn:
      "Revived last year, LIS Night is the stage where LIS students let their talent shine. Forget the quiet-librarian stereotype — we take over the night with high-energy dance, moving vocals, creative drama and crossover performances. The spotlight's on: \"LISSA, on LIVE.\" Come and watch every one of us light up the stage.",
    note: "年度盛事",
    noteEn: "Event of the year",
  },

  // 迎新宿營
  {
    type: "service", dept: "eve", slug: "camp", zh: "迎新宿營",
    nameEn: "Joint Orientation Camp",
    gc: "9 / span 2", gr: "2 / span 2",
    en: "JOINT ORIENTATION CAMP",
    intro:
      "踏入大學校園前最熱血、最難忘的第一場冒險！系學會特別攜手外系共同舉辦「跨系聯合迎新宿營」，在開學前夕帶領大一新鮮人走出日常、展開為期數天的精彩旅程；透過豐富刺激的團隊闖關、熱力四射的營火晚會與深度的夜間談心，你將提早認識照顧你的暖心學長姐，更能在第一時間結交橫跨不同科系的大學摯友，消除對新環境的陌生與焦慮，帶著滿滿的回憶與自信迎接精彩的大學第一學期！",
    introEn:
      "Your first and most unforgettable adventure before university begins! Together with other departments, we host a multi-day joint orientation camp just before the semester. Through team challenges, a campfire party and late-night talks, you'll meet the seniors who'll look out for you and make close friends across departments — and start your first semester full of confidence.",
    note: false,
  },

  // 聖誕大會
  {
    type: "service", dept: "eve", slug: "xmas", zh: "聖誕大會",
    nameEn: "Christmas Special",
    gc: "9 / span 2", gr: "1",
    en: "CHRISTMAS SPECIAL",
    intro:
      "歲末年終最溫暖浪漫的系級派對！自前年首度登場並大獲好評的「聖誕大會」，已經成為圖資人每年十二月最期待的溫馨盛典；活動現場不僅準備了讓人食指大動的豐盛美食與點心，更安排了充滿驚喜的經典交換禮物環節，以及讓大家大展歌喉的歡樂歡唱時光！在充滿節慶氛圍的冬夜裡，卸下期末前夕的課業壓力，與身邊的同學和學長姐齊聚一堂，用美食、音樂與滿滿的笑聲，為這一年畫下最溫暖難忘的句點！",
    introEn:
      "The warmest department party of the year! Since its debut two years ago, the Christmas Party has become what LIS students look forward to most every December — plenty of food and treats, a classic gift exchange and a karaoke session. Forget finals for a night and end the year with friends, music and lots of laughter.",
  },

  // 新生迎新
  {
    type: "service", dept: "eve", slug: "orientation", zh: "新生迎新",
    nameEn: "Freshman Welcome",
    gc: "6 / span 2", gr: "3 / span 1",
    en: "FRESHMAN ORIENTATION - LIS",
    intro:
      "剛踏入大學，對系上必修、系內選修滿頭問號，甚至還沒收到直屬信、問題多到不知從何問起嗎？別慌！這場新生迎新活動就是專門為你準備的！現場不僅有熱心的學長姐親自分享修課攻略與解惑，還能一起大口吃披薩點心、暢飲飲料，並透過趣味的小組破冰遊戲認識未來四年的好夥伴；不管你是想解決課業疑難雜症，還是單純想來同樂交朋友，都歡迎立刻加入我們，一起開啟精彩的圖資大學生活！",
    introEn:
      "Just started university and have no idea about required courses, electives or your mentor letter? Don't panic — this welcome party is made for you. Friendly seniors share course tips and answer your questions, and there's pizza, drinks and ice-breaker games to meet the friends you'll spend the next four years with.",
    note: "歡迎加入圖資大家庭",
    noteEn: "Welcome to the LIS family",
  },

  // 系烤活動
  {
    type: "service", dept: "eve", slug: "bbq", zh: "系烤活動",
    nameEn: "BBQ Sub Luna",
    gc: "6 / span 2", gr: "4 / span 1",
    en: "BBQ SUB LUNA",
    intro:
      "涼爽秋夜裡最不容錯過的跨系社交盛事！系學會每年精心籌備的「聯合系烤活動」，攜手友好外系一同合辦；大家在星空與微風圍繞的河濱公園齊聚一堂，一邊大啖炭火烤肉美食、一邊在音樂節奏下暢聊歡笑，不僅能加深系內夥伴的感情，更能輕鬆跨出舒適圈、結交更多志同道合的外系新朋友，一起為大學生活添上最青春難忘的夜晚回憶！",
    introEn:
      "The cross-department social event of the autumn! Every year we team up with friendly departments for a joint barbecue under the stars. Enjoy charcoal-grilled food, music and conversation — get closer to your classmates and make new friends from other departments.",
    note: "揪團烤肉",
    noteEn: "Grab your crew",
  },

  // 圖資週
  {
    type: "service", dept: "eve", slug: "lis-week", zh: "圖資週",
    nameEn: "LIS Week",
    gc: "9 / span 2", gr: "4 / span 1",
    en: "LIS WEEK",
    intro:
      "「圖資週」精心結合了系所專業特色與豐富多元的創意體驗，不僅在校園角落打造專屬的主題展覽、互動體驗與選書策展，現場更推出每日限量手作美食、甜點飲品以及極具收藏價值的系創專屬周邊；這不僅是圖資系向全校師生展現獨特魅力與活力的最佳舞台，更是系胞們齊心協力、共同揮灑熱情的重要時刻，歡迎全校師生一同走進圖資的世界，感受滿滿的知識溫度與嘉年華般的熱烈氛圍！",
    introEn:
      "LIS Week brings our field to life with creative experiences across campus: themed exhibitions, interactive activities and curated book displays, plus limited daily handmade treats, drinks and collectible department merch. It's our chance to show the whole university what LIS is about — come and join the carnival.",
    note: false,
  },

  // 耶誕舞會
  {
    type: "service", dept: "eve", slug: "xmas-ball", zh: "耶誕舞會",
    nameEn: "Christmas Ball",
    gc: "8 / span 1", gr: "3 / span 2", vertical: true,
    en: "CHRISTMAS BALL",
    intro:
      "歲末最令人引頸期盼的跨系狂歡派對！圖資系學會攜手校內多個系所包下指標性夜店，在炫目燈光與震撼重低音中引爆全場；現場備有特調飲品與熱力四射的演出，帶你徹底拋開日常繁瑣與期末壓力，穿上最耀眼的派對裝扮走進舞池，與來自不同科系的夥伴舉杯共舞、結識新朋友，在微醺節奏裡點亮最難忘的耶誕夜！",
    introEn:
      "The most anticipated cross-department party of the year! Together with departments across NTU, we book out a landmark nightclub for a night of dazzling lights and heavy bass. Signature drinks and live performances — dress up, hit the dance floor and celebrate Christmas with new friends.",
    href: "https://www.instagram.com/ivresse_2026/",
  },

  // ══ aca 學術（綠） ══
  // 教科書代訂
  {
    type: "service", dept: "aca", slug: "textbook", zh: "教科書代訂",
    nameEn: "Textbook Ordering Service",
    gc: "1 / span 3", gr: "5 / span 2",
    en: "TEXTBOOK ORDERING SERVICE",
    intro:
      "開學總是為了找原文書四處比價、煩惱運費或買錯版本嗎？圖資系學會每學期初為大家提供專業必修與核心選修的「教科書代訂服務」，不僅能省去自行尋購與國際運送的繁瑣流程，更能享有最划算的團體優惠折扣；大家只需在期限內完成線上登記，開學後就能直接在系館輕鬆取書，省時又省荷包，幫你以最完備的狀態迎接新學期的課業挑戰！",
    introEn:
      "No more comparing prices, worrying about shipping or buying the wrong edition. At the start of each semester we order textbooks for required and core elective courses at a group discount. Just register online before the deadline and pick up your books at the department once classes begin.",
    note: false,
    // 還沒填 href，所以目前不會出現「前往」按鈕；之後補上 href，下面這行就會自動生效
    dest: "教科書訂購表單",
    destEn: "Textbook order form",
    guide: [
      "請先填寫購書表單，待學術部夥伴寄信通知",
      "取書當天請備妥現金",
    ],
    guideEn: [
      "Fill in the order form and wait for an email from the Academic team",
      "Please bring cash on pick-up day",
    ],
  },

  // 系友講座
  {
    type: "service", dept: "aca", slug: "alumni", zh: "系友講座",
    nameEn: "LIS Talks",
    gc: "2 / span 2", gr: "7 / span 2",
    en: "LIS TALKS",
    intro:
      "想知道圖資系畢業後能走入哪些多元領域嗎？系學會定期舉辦「系友講座（LIS Talks）」，特別邀請來自軟體科技、數據分析、數位行銷、學術研究、出版策展及文化機構等不同產業的學長姐重返母校，親自拆解求職心路歷程、職場實戰經驗與行業趨勢；透過近距離的對談交流與提問互動，不僅能打破你的職涯迷惘、看見跨領域發展的各種可能，更是提早拓展人脈網絡、為未來的實習與就業做好準備的最佳契機！",
    introEn:
      "Where can an LIS degree take you? Our LIS Talks invite alumni from software, data analytics, digital marketing, research, publishing, curation and cultural institutions to share their job-hunting stories, real-world experience and industry trends. Ask questions, find direction and start building your network for internships and jobs.",
    note: false,
  },

  // 企業參訪
  {
    type: "service", dept: "aca", slug: "corp", zh: "企業參訪",
    nameEn: "Corp. Visits",
    gc: "4 / span 2", gr: "5 / span 2",
    en: "CORP. VISIT",
    intro:
      "走出校園理論，親眼見證圖資專業在產業界的真實實踐！為了替系胞拓展更多元開闊的視野，系學會正積極尋求各方管道與合作機會，致力推動前所未有的「企業參訪」計畫；我們將接洽科技資訊、數據分析、數位內容與文化機構等多元領域的指標性企業，帶領大家走進產業第一線，實地了解職場運作模式、工作環境與未來人才需求，期待為系上同學搭建起與產業接軌的堅實橋樑，提前為未來的實習與職涯佈局做好萬全準備！",
    introEn:
      "See LIS in action beyond the classroom! We're working on a brand-new company visit program, reaching out to leading organizations in tech, data analytics, digital content and culture. Step onto the front line, see how real workplaces run and what talent they look for — and get a head start on internships and careers.",
    note: false,
  },

  // 杜鵑花節
  {
    type: "service", dept: "aca", slug: "azalea", zh: "杜鵑花節",
    nameEn: "Azalea Festival",
    gc: "4 / span 2", gr: "7 / span 2",
    en: "AZALEA FESTIVAL",
    intro:
      "每逢三月杜鵑花盛開之際，臺大杜鵑花節學系博覽會是高中生與大眾深入認識圖資系的最佳窗口。圖資系巧妙融合人文關懷與資訊科技，涉獵領域從大數據分析、資訊檢索、數位策展到知識組織，徹底顛覆你對圖書館與資訊學的傳統想像；在博覽會攤位上，熱情的學長姐不僅會親自解析多元的課程地圖與升學面試技巧，現場更準備了趣味互動遊戲與限量系創週邊，帶你全面解鎖圖資人的精彩日常，找到未來升學與職涯的無限可能！",
    introEn:
      "Every March, when the azaleas bloom, NTU's department fair is the best way for high school students and the public to discover LIS. Our field combines the humanities with information technology — from big data and information retrieval to digital curation and knowledge organization. At our booth, students explain the curriculum and interview tips, with interactive games and limited-edition merch.",
    note: "招生季",
    noteEn: "Admissions season",
  },

  // ══ ima 美宣（紫） ══
  // 社群經營
  {
    type: "service", dept: "ima", slug: "socials", zh: "社群經營",
    nameEn: "Social Media",
    gc: "6", gr: "5 / span 2", vertical: true,
    en: "SOCIAL MEDIA",
    intro:
      "零時差掌握系上脈動、連結圖資人的大小事！系學會全面布局並用心深耕三大社群平台，同時持續營運溫馨互助的「臺大圖資系交流版」，為系胞打造全方位的資訊網絡；無論是各項精彩活動資訊、重要權益福利公告，還是日常生活與課業資源的即時交流，我們都致力於在第一時間將最清晰、最快速的第一手消息送到大家眼前，打破資訊壁壘，讓你隨時隨地都能輕鬆參與系上大小事，與整個圖資社群緊密相連！",
    introEn:
      "Stay on top of everything happening in LIS. We run three social media platforms and the NTU LIS community board, bringing you event news, member benefit announcements and everyday study resources as soon as they're out — so you're always connected to the LIS community.",
    note: "追蹤我們",
    noteEn: "Follow us",
    href: "#/contact",
    dest: "系學會社群平台",
    destEn: "Our social channels",
  },

  // 系服訂購
  {
    type: "service", dept: "ima", slug: "ooty", zh: "系服訂購",
    nameEn: "OOTY LIS",
    gc: "7", gr: "5 / span 2", vertical: true,
    en: "OOTY LIS",
    intro:
      "每一位圖資人的衣櫃裡，都必須擁有一件專屬的年度代表作！系學會推出的「系服訂購」可謂是圖資人當之無愧的年度時尚指標 OOTY（Outfit of the Year），兼具質感剪裁與系所精神的獨創設計，無論是日常上課穿搭、系上大型活動還是系隊征戰，穿上它就能一眼認出彼此、展現最強凝聚力；有繳納系學會費的同學還能享有專屬的訂購減免優惠，快跟上全系潮流換上今年的代表戰袍，穿出屬於圖資人的專屬風格！",
    introEn:
      "Every LIS student needs this year's signature piece! Our department apparel is the OOTY — Outfit of the Year — with a quality cut and an original design that carries the spirit of LIS. Wear it to class, department events or team games and spot each other instantly. Members get a discount on orders.",
  },

  // 聯絡我們
  {
    type: "service", dept: "ima", slug: "contact", zh: "聯絡我們",
    nameEn: "Contact Us",
    gc: "9 / span 1", gr: "7 / span 2", vertical: true,
    en: "CONTACT US",
    intro:
      "「臺大圖資系學會是全體圖資系同學的」，你的每一道聲音與想法，都是推動系學會前進最重要的動力，因為全體同學的訴求，就是系學會全力以赴的訴求！無論你在系學會庶務運作、各項精彩活動有任何建議與疑問，在課業學習與校園生活上面臨困難需要協助發聲，或是跨系合作、企業贊助與各類創新活動有任何想法，都非常歡迎透過系學會官方信箱、社群平台等多個渠道與我們聯繫；我們始終在這裡傾聽、陪伴與爭取，期待與每一位夥伴攜手激盪更多火花，共同打造一個更精彩美好的圖資大家庭！",
    introEn:
      "\"The NTU LIS Student Association belongs to every LIS student.\" Your voice is what drives us forward. Whether you have suggestions about our operations or events, need someone to speak up for you about your studies or campus life, or have ideas for collaborations, sponsorships or new activities, reach us by email or on social media. We're always here to listen.",
    note: false,
    href: "#/contact",
    dest: "聯絡我們",
    destEn: "Contact us",
  },

  // 文宣品
  {
    type: "service", dept: "ima", slug: "poster", zh: "文宣品",
    nameEn: "Poster Design",
    gc: "8 / span 2", gr: "6 / span 1",
    en: "POSTER DESIGN",
    intro:
      "悄悄融入圖資日常的全新存在！系學會特別精心策劃與設計的「專屬文宣品」，打破了以往的空白，現在只要在系上的每一個活動場合，都能看見它們陪伴大家的身影；從精緻可愛的主題貼紙、實用小物到充滿系所特色的紀念周邊，不僅為每場活動增添儀式感與視覺亮點，更是每位圖資人共同回憶的最佳載體，走過路過千萬別忘了收集，把專屬於圖資的獨特印記帶回家！",
    introEn:
      "A new part of everyday LIS life! Our specially designed promotional items now appear at every department event — from cute themed stickers and handy goods to souvenirs full of LIS character. They make each event special and become shared memories. Don't forget to collect them all!",
    note: false,
  },

  // 系學會官方網站
  {
    type: "service", dept: "ima", slug: "website", zh: "系學會官方網站",
    nameEn: "Official Site",
    gc: "6 / span 3", gr: "7 / span 2",
    en: "OFFICIAL SITE",
    intro:
      "將圖資專業化為真實體驗，打造屬於全系的新一代數位樞紐！臺大圖資系長年深耕資訊架構、人機互動與使用者體驗（UI/UX），系學會秉持學以致用的核心精神，親自操刀規劃與建置了專屬官方網站；我們打破以往學生社團僅依賴社群平台零散宣傳的侷限，以現代直覺的互動設計與清晰嚴謹的資訊架構，整合系級活動、福利權益、行政申請與生活資源，不僅為系上同學提供穩定、透明且極致流暢的數位服務，更以實際行動向外界展現圖資人在數位產品設計上的硬實力！",
    introEn:
      "Turning what we study into something real: a new digital hub for the whole department. NTU LIS has long focused on information architecture, human–computer interaction and UI/UX, and we put that into practice by designing and building this site ourselves. Instead of scattered social posts, it brings events, member benefits, applications and resources together with clear structure and intuitive design.",
    // ⚠ 原本寫 "ntulissa.com" 少了 https://，會被當成站內相對路徑、連到錯的網址，已補上
    href: "https://www.ntulissa.com",
    dest: "系學會官方網站",
    destEn: "Official website",
  },

  // ══ sp 體育（藍） ══
  // 系隊補助
  {
    type: "service", dept: "sp", slug: "team-aid", zh: "系隊補助",
    nameEn: "Team Aid",
    gc: "11 / span 1", gr: "5 / span 4", vertical: true,
    en: "TEAM AID",
    intro:
      "揮灑汗水、爭取榮譽的最佳後盾！為了鼓勵系上各系隊蓬勃發展，只要隊內成員依規定繳納系學會費，系學會每學期皆會依比例提供專屬的「系隊經費補助」；這筆經費用於支持各隊租借場地、添購耗材或添補訓練裝備，減輕同學們的運動負擔，讓大家在球場上能全心全力拼搏，盡情展現圖資人的熱血精神！",
    introEn:
      "Backing our teams on and off the court! Each semester, the association funds department sports teams in proportion to the number of members who have paid the membership fee. The money goes toward court rentals, supplies and training gear, so players can focus on the game.",
    note: "支援系隊",
    noteEn: "Supporting our teams",
  },

  // 小圖盃
  {
    type: "service", dept: "sp", slug: "lis-cup", zh: "小圖盃",
    nameEn: "LIS Cup",
    gc: "12 / span 1", gr: "5 / span 2", vertical: true,
    en: "LIS CUP",
    intro:
      "闊別多年、自前年強勢重啟復辦的「小圖盃」，是圖資系一年一度最熱血的全民體育盛會！這場賽事完全打破系所與身分界線，不僅歡迎系胞組隊同樂，更熱烈邀請外系好友以及系上教授一同走進球場切磋切磋；過去賽程涵蓋了籃球、羽球與排球三大經典球類項目，未來更持續朝著新增多元運動項目的方向邁進，無論你是想在場上爭奪榮耀、享受師生趣味對決，還是單純來為身邊好友熱血應援，都絕對不能錯過這場凝聚力爆棚的年度運動盛典！",
    introEn:
      "Revived two years ago after a long break, the LIS Cup is our biggest sports event of the year. It's open to everyone — LIS students, friends from other departments and even our professors. Past tournaments featured basketball, badminton and volleyball, with more sports to come. Compete for glory, enjoy student-vs-professor matches or just come and cheer.",
    note: false,
  },

  // 臺大日文圖資男籃
  {
    type: "service", dept: "sp", slug: "basketball", zh: "臺大日文圖資男籃",
    nameEn: "J-LIS Men's Basketball",
    gc: "10 / span 1", gr: "5 / span 4", vertical: true,
    en: "NTU J-LIS MEN'S BASKETBALL",
    intro:
      "喜歡在球場上盡情奔跑、揮灑汗水的熱血快感嗎？「臺大日文圖資男籃」由日文系與圖資系攜手組成，不僅每週擁有兩次扎實的練球時光，讓你在切磋球技中不斷進化，場外更有歡樂滿點的隊聚與隊遊活動，緊密凝聚每一位隊員的好感情！無論你是具備實力的各路好手，還是單純熱愛籃球的熱血新血，我們都張開雙臂歡迎你的加入；此外，球隊也同步熱烈招收工作人員（球經），邀請你一起成為球場邊最堅實的後盾，共享每一場比賽的感動與榮耀！",
    introEn:
      "Love running the court and working up a sweat? NTU J-LIS Men's Basketball is a joint team of the Japanese and LIS departments. We train twice a week and bond through team dinners and trips. Experienced players and passionate beginners are all welcome — and we're also recruiting team managers to support us from the sidelines.",
    href: "https://www.instagram.com/ntu_jlis_mbc/",
    dest: "Instagram 球隊帳號",
    destEn: "Team Instagram",
    guide: [
      "練球時間：每週一、四 18:30 - 20:30",
      "練球地點：社會創新實驗中心旁球場",
      "搭公車請搭 311 至「仁愛建國路口二」",
      "搭捷運請於「忠孝復興站」下車，步行約 10 分鐘",
      "球隊亦招收工作人員（球經），歡迎對籃球有熱情的你加入！",
    ],
    guideEn: [
      "Practice: Mon & Thu, 6:30–8:30 p.m.",
      "Location: court next to the Social Innovation Lab",
      "By bus: take 311 to \"Ren'ai Jianguo Intersection (2)\"",
      "By MRT: Zhongxiao Fuxing Station, about a 10-minute walk",
      "We're also recruiting team managers — basketball fans welcome!",
    ],
  },

  // 臺大圖資女排
  {
    type: "service", dept: "sp", slug: "volleyball", zh: "臺大圖資女排",
    nameEn: "LIS Women's Volleyball",
    gc: "11", gr: "1 / span 4", vertical: true,
    en: "NTU LIS WOMEN'S VOLLEYBALL",
    intro:
      "球不落地、絕不放棄！「臺大圖資女排」在去年正式重新建隊，帶著滿滿的活力與衝勁強勢回歸球場！無論你是擁有排球底子、想繼續在場上扣殺撲救的高手，還是完全零基礎但對排球抱有熱情的新手，球隊都非常歡迎妳的加入；在這裡，大家在練球中互相扶持、從托球墊球一步步累積默契，場下更有溫暖歡樂的隊友陪伴彼此成長，快加入圖資女排的大家庭，一起為每一顆好球奮力喝采、寫下熱血的青春篇章！",
    introEn:
      "Never let the ball drop! NTU LIS Women's Volleyball was re-formed last year and is back on the court with plenty of energy. Whether you're an experienced player or a complete beginner who loves the sport, you're welcome here. We support each other in practice, build teamwork pass by pass, and grow together as friends off the court.",
    note: false,
  },

  // 臺大圖資羽球
  {
    type: "service", dept: "sp", slug: "badminton", zh: "臺大圖資羽球",
    nameEn: "LIS Badminton",
    gc: "12", gr: "1 / span 4", vertical: true,
    en: "NTU LIS BADMINTON",
    intro:
      "想在課餘時間揮拍流汗、享受羽球破風的俐落快感嗎？「臺大圖資羽球隊」不限性別、男女生都熱烈歡迎！不論你是身經百戰的場上高手，還是剛拿起球拍想運動健身的初學者，這裡都有最友善耐心的學長姐陪伴你一起練習、精進球技；除了定期的練球時間外，隊上溫馨歡樂的氛圍更是系胞們放鬆交流、培養深厚情誼的最佳所在，快帶著你的球拍加入我們，在球場上一同揮灑青春汗水！",
    introEn:
      "Want to swing a racket and enjoy the speed of badminton after class? NTU LIS Badminton welcomes players of all genders and levels — from seasoned competitors to beginners just picking up a racket. Friendly seniors will practice with you, and the team's warm atmosphere makes it a great place to relax and make friends.",
    note: false,
    href: "https://docs.google.com/forms/d/e/1FAIpQLSfceVuE84VkAlN0jfwEOjXRNOd29X0530fpMRnv7bZsmOKCPA/viewform?usp=publish-editor",
    dest: "系羽報名表單",
    destEn: "Team sign-up form",
  },
];

// 服務格型別（給部門頁輪播接資料用）
export type ServiceCell = Extract<Cell, { type: "service" }>;

// 詳情頁用：以 slug 找服務資料
export function serviceBySlug(slug: string): ServiceCell | undefined {
  return BENTO.find((c) => c.type === "service" && c.slug === slug) as ServiceCell | undefined;
}

// 部門頁輪播用：撈某部門底下所有業務（依 BENTO 排列順序；hideInDept 的會被跳過）
export function servicesByDept(dept: Dept): ServiceCell[] {
  return BENTO.filter(
    (c): c is ServiceCell => c.type === "service" && c.dept === dept && !c.hideInDept
  );
}

// 取得「目前語言版本」的服務資料：英文版時用 nameEn / introEn / noteEn / destEn / guideEn
// 取代中文欄位（沒填英文就沿用中文）。回傳的物件欄位名稱不變，畫面程式碼照常讀 zh / intro / note…
export function localizeService(svc: ServiceCell, lang: Lang): ServiceCell {
  if (lang !== "en") return svc;
  return {
    ...svc,
    zh: svc.nameEn || svc.zh,
    intro: svc.introEn || svc.intro,
    note: svc.noteEn !== undefined ? svc.noteEn : svc.note,
    dest: svc.destEn !== undefined ? svc.destEn : svc.dest,
    guide: svc.guideEn ?? svc.guide,
  };
}