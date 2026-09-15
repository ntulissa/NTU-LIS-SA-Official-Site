// ════════════════════════════════════════════════════════════════
// 各種服務 · 資料檔（Services.tsx 從這裡讀取，資料與呈現分離）
// ────────────────────────────────────────────────────────────────
// 改「哪些格子、放哪、什麼顏色、詳情頁內容」都在這個檔；Services.tsx 只負責畫。
//   type:"dept"    部門名稱格（填滿部門色 + 顯示 imports/services/IMG-<dept>/<dept>.svg）
//   type:"service" 業務格（外框部門色、hover 才填色；點擊進 #/service/<slug>）
//   佈局：12 欄 × 8 列；gc/gr = CSS grid-column / grid-row 字串，例："3 / span 3"
//   vertical:true  = 直排文字（窄長格用）
//   詳情頁欄位：en 英文標題、intro 介紹、note 便利貼、href 相關網址（沒填＝顯示「準備中」膠囊）
// ════════════════════════════════════════════════════════════════

export type Dept = "gen" | "eve" | "aca" | "ima" | "sp";

// 五個部門色（Bento 格線色、詳情頁背景色都吃這裡）— 你的正式色票
export const DEPT_COLORS: Record<Dept, string> = {
  gen: "#915E3E", // 行政（棕）
  eve: "#9F353A", // 活動（紅）
  aca: "#42602D", // 學術（綠）
  ima: "#572A3F", // 美宣（紫）
  sp:  "#23658A", // 體育（藍）
};

export type Cell =
  | { type: "dept"; dept: Dept; gc: string; gr: string }
  | {
      type: "service"; dept: Dept; slug: string; zh: string; gc: string; gr: string;
      vertical?: boolean; en: string; intro: string; href?: string;
      // note 便利貼：不想要就填 false（或直接省略）；填字串才會顯示。
      note?: string | false;
    };

export const BENTO: Cell[] = [
  // ── 部門名稱格（填色 + svg）──
  { type: "dept", dept: "gen", gc: "1 / span 2", gr: "1 / span 1" },
  { type: "dept", dept: "eve", gc: "6",          gr: "1 / span 2" },
  { type: "dept", dept: "aca", gc: "1",          gr: "7 / span 2" },
  { type: "dept", dept: "ima", gc: "8 / span 2", gr: "5 / span 1" },
  { type: "dept", dept: "sp",  gc: "12",         gr: "7 / span 2" },

  // ── gen 行政（棕）──
  { type: "service", dept: "gen", slug: "fee",       zh: "系學會費",       gc: "1",          gr: "2 / span 3", vertical: true, en: "MEMBERSHIP FEE",     intro: "繳納系學會費不僅是對系上運作的支持，更是伴隨你四年大學生活最超值的專屬投資！有繳費的系胞立即享有「五大核心權益」：迎新活動直接免費參加、系館專屬系櫃享免租金借用、學術部嚴選教科書享有更便宜的團購專屬優惠價、系服訂購享有減免折扣，以及系烤、舞會等整年度各大精彩活動的專屬報名優惠價；一份會費直接解鎖學習置物、課業購書到社交娛樂的全方位福利，陪伴你用最划算、充實的方式度過整個圖資大學生活！", note: "一年一次" },
  { type: "service", dept: "gen", slug: "locker",    zh: "系櫃租借",       gc: "2",          gr: "2 / span 3", vertical: true, en: "LOCKER RENTAL",      intro: "每天往返系館總是被厚重的原文書、筆電與雜物壓得喘不過氣嗎？系學會於每學年提供「系櫃租借服務」，為系上同學打造專屬且安全的置物空間；無論是課業教材、雨具或私人物品，都能妥善收納在系館內，讓你省去每日奔波揹負重物的負擔，課堂空檔也能輕裝穿梭於校園之間，用最輕鬆優雅的步調享受充實的大學生活！", note: "數量有限" },
  { type: "service", dept: "gen", slug: "studyroom", zh: "學輔室使用申請", gc: "3 / span 3", gr: "1 / span 2", en: "STUDY ROOM BOOKING", intro: "（介紹內文佔位）學輔室的借用流程、開放時段與注意事項。", note: "線上預約" },
  { type: "service", dept: "gen", slug: "aircon",    zh: "學輔室冷氣使用", gc: "3 / span 3", gr: "3 / span 2", en: "STUDY ROOM AIR-CON", intro: "自第 52 屆系學會起正式開放學輔室冷氣讓大家免費吹，希望為系胞打造一個清涼舒適的自習與討論空間；但享受福利的同時也需要大家共同守護，冷氣運轉期間請隨手關門並上鎖其中一扇以防被風吹開，使用完畢務必主動關閉電源並將遙控器放回原位，若未遵守規範將考慮暫停開放以示警告，美好的共享資源有賴全體同學共同維持，感謝大家的配合！", note: false },

  // ── eve 活動（紅）──
  { type: "service", dept: "eve", slug: "lis-night",        zh: "圖資之夜", gc: "7 / span 2", gr: "1 / span 2", en: "LIS NIGHT",        intro: "（介紹內文佔位）圖資之夜的活動內容與報名資訊。", note: "年度盛事" },
  { type: "service", dept: "eve", slug: "orientation-camp", zh: "迎新宿營", gc: "9 / span 2", gr: "1",          en: "ORIENTATION CAMP", intro: "踏入大學校園前最熱血、最難忘的第一場冒險！系學會特別攜手外系共同舉辦「跨系聯合迎新宿營」，在開學前夕帶領大一新鮮人走出日常、展開為期數天的精彩旅程；透過豐富刺激的團隊闖關、熱力四射的營火晚會與深度的夜間談心，你將提早認識照顧你的暖心學長姐，更能在第一時間結交橫跨不同科系的大學摯友，消除對新環境的陌生與焦慮，帶著滿滿的回憶與自信迎接精彩的大學第一學期！", note: false },
  { type: "service", dept: "eve", slug: "christmas",        zh: "聖誕大會", gc: "9 / span 2", gr: "2",          en: "CHRISTMAS PARTY",  intro: "歲末年終最溫暖浪漫的系級派對！自前年首度登場並大獲好評的「聖誕大會」，已經成為圖資人每年十二月最期待的溫馨盛典；活動現場不僅準備了讓人食指大動的豐盛美食與點心，更安排了充滿驚喜的經典交換禮物環節，以及讓大家大展歌喉的歡樂歡唱時光！在充滿節慶氛圍的冬夜裡，卸下期末前夕的課業壓力，與身邊的同學和學長姐齊聚一堂，用美食、音樂與滿滿的笑聲，為這一年畫下最溫暖難忘的句點！", note: "溫馨" },
  { type: "service", dept: "eve", slug: "freshman",         zh: "新生迎新", gc: "6",          gr: "3 / span 2", en: "FRESHMAN WELCOME", intro: "剛踏入大學，對系上必修、系內選修滿頭問號，甚至還沒收到直屬信、問題多到不知從何問起嗎？別慌！這場新生迎新活動就是專門為你準備的！現場不僅有熱心的學長姐親自分享修課攻略與解惑，還能一起大口吃披薩點心、暢飲飲料，並透過趣味的小組破冰遊戲認識未來四年的好夥伴；不管你是想解決課業疑難雜症，還是單純想來同樂交朋友，都歡迎立刻加入我們，一起開啟精彩的圖資大學生活！", note: "歡迎新生", vertical: true },
  { type: "service", dept: "eve", slug: "bbq",              zh: "系烤活動", gc: "7 / span 2", gr: "3 / span 2", en: "DEPT BBQ",         intro: "涼爽秋夜裡最不容錯過的跨系社交盛事！系學會每年精心籌備的「聯合系烤活動」，攜手友好外系一同合辦；大家在星空與微風圍繞的河濱公園齊聚一堂，一邊大啖炭火烤肉美食、一邊在音樂節奏下暢聊歡笑，不僅能加深系內夥伴的感情，更能輕鬆跨出舒適圈、結交更多志同道合的外系新朋友，一起為大學生活添上最青春難忘的夜晚回憶！", note: "揪團烤肉" },
  { type: "service", dept: "eve", slug: "lis-week",         zh: "圖資週",   gc: "9 / span 2", gr: "3 / span 2", en: "LIS WEEK",         intro: "（介紹內文佔位）圖資週的系列活動與擺攤。", note: "整週活動" },

  // ── aca 學術（綠）──
  { type: "service", dept: "aca", slug: "textbook",      zh: "教科書代訂", gc: "1 / span 3", gr: "5 / span 2", en: "TEXTBOOK ORDERING SERVICE", intro: "開學總是為了找原文書四處比價、煩惱運費或買錯版本嗎？圖資系學會每學期初為大家提供專業必修與核心選修的「教科書代訂服務」，不僅能省去自行尋購與國際運送的繁瑣流程，更能享有最划算的團體優惠折扣；大家只需在期限內完成線上登記，開學後就能直接在系館輕鬆取書，省時又省荷包，幫你以最完備的狀態迎接新學期的課業挑戰！", note: "10小時後截止", href: "" },
  { type: "service", dept: "aca", slug: "company-visit", zh: "企業參訪",   gc: "4 / span 2", gr: "5 / span 2", en: "COMPANY VISIT",             intro: "（介紹內文佔位）企業參訪的名額、行程與報名。", note: "看看業界" },
  { type: "service", dept: "aca", slug: "alumni-talk",   zh: "系友講座",   gc: "2 / span 2", gr: "7 / span 2", en: "ALUMNI TALK",               intro: "想知道圖資系畢業後能走入哪些多元領域嗎？系學會定期舉辦「系友講座（LIS Talk）」，特別邀請來自軟體科技、數據分析、數位行銷、學術研究、出版策展及文化機構等不同產業的學長姐重返母校，親自拆解求職心路歷程、職場實戰經驗與行業趨勢；透過近距離的對談交流與提問互動，不僅能打破你的職涯迷惘、看見跨領域發展的各種可能，更是提早拓展人脈網絡、為未來的實習與就業做好準備的最佳契機！", note: "前輩經驗" },
  { type: "service", dept: "aca", slug: "azalea",        zh: "杜鵑花節",   gc: "4 / span 2", gr: "7 / span 2", en: "AZALEA FESTIVAL",           intro: "每逢三月杜鵑花盛開之際，臺大杜鵑花節學系博覽會是高中生與大眾深入認識圖資系的最佳窗口。圖資系巧妙融合人文關懷與資訊科技，涉獵領域從大數據分析、資訊檢索、數位策展到知識組織，徹底顛覆你對圖書館與資訊學的傳統想像；在博覽會攤位上，熱情的學長姐不僅會親自解析多元的課程地圖與升學面試技巧，現場更準備了趣味互動遊戲與限量系創週邊，帶你全面解鎖圖資人的精彩日常，找到未來升學與職涯的無限可能！", note: "招生季" },

  // ── ima 美宣（紫）──
  { type: "service", dept: "ima", slug: "social",     zh: "社群經營", gc: "6", gr: "5 / span 4", vertical: true, en: "SOCIAL MEDIA", intro: "（介紹內文佔位）系學會社群的經營與內容。", note: "追蹤我們" },
  { type: "service", dept: "ima", slug: "dept-shirt", zh: "系服訂購", gc: "7", gr: "5 / span 4", vertical: true, en: "DEPT SHIRT",   intro: "（介紹內文佔位）系服的款式、尺寸與訂購。", note: "限時開賣" },
  { type: "service", dept: "ima", slug: "contact",    zh: "聯絡我們", gc: "8 / span 2", gr: "7 / span 2", en: "CONTACT US", intro: "（介紹內文佔位）各種合作與聯繫管道。", note: "找得到我們" },
  { type: "service", dept: "ima", slug: "souvenir",     zh: "文宣品", gc: "8 / span 2", gr: "6 / span 1", en: "POSTER DESIGN", intro: "（介紹內文佔位）系學會活動的海報設計與製作。", note: "美宣專業" },

  // ── sp 資訊/公關（藍）下排 ──
  { type: "service", dept: "sp", slug: "men-basket", zh: "臺大日文圖資男籃",gc: "10 / span 1", gr: "5 / span 4", vertical: true, en: "NTU J-LIS MEN'S BASKETBALL", intro: "喜歡在球場上盡情奔跑、揮灑汗水的熱血快感嗎？「臺大日文圖資男籃」由日文系與圖資系攜手組成，不僅每週擁有兩次扎實的練球時光，讓你在切磋球技中不斷進化，場外更有歡樂滿點的隊聚與隊遊活動，緊密凝聚每一位隊員的好感情！無論你是具備實力的各路好手，還是單純熱愛籃球的熱血新血，我們都張開雙臂歡迎你的加入；此外，球隊也同步熱烈招收工作人員（球經），邀請你一起成為球場邊最堅實的後盾，共享每一場比賽的感動與榮耀！"},
  { type: "service", dept: "sp", slug: "team-aid", zh: "系隊補助",gc: "11 / span 1", gr: "5 / span 4", vertical: true, en: "TEAM AID", intro: "揮灑汗水、爭取榮譽的最佳後盾！為了鼓勵系上各系隊蓬勃發展，只要隊內成員依規定繳納系學會費，系學會每學期皆會依比例提供專屬的「系隊經費補助」；這筆經費用於支持各隊租借場地、添購耗材或添補訓練裝備，減輕同學們的運動負擔，讓大家在球場上能全心全力拼搏，盡情展現圖資人的熱血精神！", note: "支援系隊" },
  { type: "service", dept: "sp", slug: "lis-cup",    zh: "小圖盃",gc: "12 / span 1", gr: "5 / span 2", vertical: true, en: "LIS CUP", intro: "（介紹內文佔位）小圖盃的賽制與報名。", note: "友誼賽" },
  { type: "service", dept: "sp", slug: "women-volley", zh: "臺大圖資女排", gc: "11", gr: "1 / span 4", vertical: true, en: "NTU LIS WOMEN'S VOLLEYBALL", intro: "球不落地、絕不放棄！「臺大圖資女排」在去年正式重新建隊，帶著滿滿的活力與衝勁強勢回歸球場！無論你是擁有排球底子、想繼續在場上扣殺撲救的高手，還是完全零基礎但對排球抱有熱情的新手，球隊都非常歡迎妳的加入；在這裡，大家在練球中互相扶持、從托球墊球一步步累積默契，場下更有溫暖歡樂的隊友陪伴彼此成長，快加入圖資女排的大家庭，一起為每一顆好球奮力喝采、寫下熱血的青春篇章！", note: "熱血" },
  { type: "service", dept: "sp", slug: "badminton",    zh: "臺大圖資羽球", gc: "12", gr: "1 / span 4", vertical: true, en: "BADMINTON",          intro: "想在課餘時間揮拍流汗、享受羽球破風的俐落快感嗎？「臺大圖資羽球隊」不限性別、男女生都熱烈歡迎！不論你是身經百戰的場上高手，還是剛拿起球拍想運動健身的初學者，這裡都有最友善耐心的學長姐陪伴你一起練習、精進球技；除了定期的練球時間外，隊上溫馨歡樂的氛圍更是系胞們放鬆交流、培養深厚情誼的最佳所在，快帶著你的球拍加入我們，在球場上一同揮灑青春汗水！", note: "揮拍" },
];

// 詳情頁用：以 slug 找服務資料
export function serviceBySlug(slug: string) {
  return BENTO.find((c) => c.type === "service" && c.slug === slug) as
    | Extract<Cell, { type: "service" }>
    | undefined;
}