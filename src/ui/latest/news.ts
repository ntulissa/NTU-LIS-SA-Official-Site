// ══════════════════════════════════════════════════════════════════════════
// 公告資料（「公告列表頁」與「公告文章頁」共用同一份）。要新增／修改公告都改這裡。
// 放置位置建議：src/ui/latest/news.ts
//
// 一篇公告 = 一個物件，欄位說明：
//   slug          網址代稱（只用英數與 -），文章頁網址＝ #/news/<slug>，不可重複。
//   category      右上角標籤文字（例："學會公告"）。
//   title         標題。
//   author        作者掛名（例："圖資四 曾柏翰"）；沒有就留空字串 ""。
//   date          日期字串（例："2026.08.12"）。
//   excerpt       列表卡片上的一句摘要。
//   paragraphs    內文，一段一個字串（陣列）；要幾段就放幾個字串。
//   image?        文章大圖：先在最上面 import 你的圖，再填在這裡。★不填＝這篇沒有圖（純文字排版）。
//   imageCaption? 圖說（有圖才會用到）。
//
// ── 英文版（切換到 EN 時顯示；都可省略，省略＝英文版先顯示中文）──
//   categoryEn / titleEn / authorEn / excerptEn / paragraphsEn / imageCaptionEn
//   ★ 畫面上用 localize(公告) 取得目前語言版本（見 i18n/index.tsx）。
// ══════════════════════════════════════════════════════════════════════════

// 範例文章的照片：先「暫時借用」現有的建築圖當佔位，確保專案能編譯、也能直接看到「有圖版型」。
// 換成真的照片：把照片放到 src/imports/LatestUpdates/ 後，改成 import 你的檔案即可，例如：
//   import inaugurationPhoto from "@/imports/LatestUpdates/53-inauguration.jpg";
import inaugurationPhoto from "@/imports/LatestUpdates/inauguration.png";
import farewell52image from "@/imports/LatestUpdates/farewell52.png";
import election2026 from "@/imports/LatestUpdates/election2026.png";
import welcome2026 from "@/imports/LatestUpdates/welcome2026.png";
import loungeNightUsage from "@/imports/LatestUpdates/lounge night.svg";
import recruit2026 from "@/imports/LatestUpdates/recruit2026.png";
import lockerclearance from "@/imports/LatestUpdates/lockerclearance.svg";
import airconRules from "@/imports/LatestUpdates/airconRules.svg";
import welcomeLISSA2026 from "@/imports/LatestUpdates/welcomeLISSA2026.svg";

export type Announcement = {
  slug: string;
  category: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  paragraphs: string[];
  image?: string;
  imageCaption?: string;
  // ── 英文版（可省略）──
  categoryEn?: string;
  titleEn?: string;
  authorEn?: string;
  excerptEn?: string;
  paragraphsEn?: string[];
  imageCaptionEn?: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    slug: "recruitment-end-2026",
    category: "學會公告",
    categoryEn: "Announcement",
    title: "第 53 屆系學會招募結束",
    titleEn: "Recruitment for the 53rd LISSA Ends",
    author: "臺大圖資系學會",
    authorEn: "NTU LIS Student Association",
    date: "2026.10.20",
    excerpt: "第 53 屆系學會工作團隊招募面談已於 2026/10/19（一）正式告一段落。",
    excerptEn: "The recruitment interviews for the 53rd LISSA team have officially concluded on 2026/10/19 (Monday).",
    paragraphs: [
      "第 53 屆系學會工作團隊招募面談已於 2026/10/19（一）正式告一段落。",
      "非常感謝所有撥空前來參與面談的同學，在交流的過程中，我們看見了大家對系學會的熱情、想法與對圖資系的期待，每一份心意都讓我們倍感珍惜與感動！",
      "接下來幾天，我們將陸續寄發「錄取通知信」至大家填寫的信箱，並協助錄取夥伴加入各部門群組、正式展開系學會的工作與合作。再次感謝每一位願意踏出這一步、加入團隊的你們，期待未來一年攜手同行，一起打造更好的圖資系學會！",
    ],
    paragraphsEn: [
      "The recruitment interviews for the 53rd LISSA team have officially concluded on 2026/10/19 (Monday).",
      "We sincerely thank all the students who took the time to participate in the interviews. During our conversations, we witnessed your passion for the association, your ideas, and your expectations for the LIS department. Every bit of your enthusiasm is deeply appreciated and moving!",
      "In the coming days, we will be sending out acceptance notification emails to the addresses you provided, and assisting accepted members in joining their respective department groups to officially begin their work and collaboration within the association.",
      "Once again, thank you to everyone who took this step and joined the team. We look forward to working together over the next year to create an even better LIS SA!",
    ],
    image: welcomeLISSA2026,
  },
  {
    slug: "lounge-rules",
    category: "正副會長",
    categoryEn: "Presidents",
    title: "學輔室與冷氣使用須知",
    titleEn: "Student Lounge & Air-Con Usage Guidelines",
    author: "臺大圖資系學會",
    authorEn: "NTU LIS Student Association",
    date: "2026.10.20",
    excerpt: "學輔室是系學會用心為大家維護的共同空間，提供舒適冷氣、系櫃租借以及期中期末考前的夜間延長使用福利，歡迎系上同學多加利用！為了維持優質的自修與討論環境，請大家共同遵守以下規範：",
    excerptEn: "The student lounge is a shared space maintained by the LIS Student Association, offering comfortable air conditioning, locker rentals, and extended evening access before midterms and finals. We encourage all students to make use of this space! To maintain a high-quality study and discussion environment, please adhere to the following guidelines:",
    paragraphs: [
      "學輔室是系學會用心為大家維護的共同空間，提供舒適冷氣、系櫃租借以及期中期末考前的夜間延長使用福利，歡迎系上同學多加利用！為了維持優質的自修與討論環境，請大家共同遵守以下規範：",
      "1. 輕聲細語，尊重他人",
      "學輔室主要作為用餐、休息、研讀與自修空間，若有討論需求請放低音量，以「不影響他人」為最高原則，共同維護安靜專注的環境。",
      "2. 隨手關閉冷氣，遙控器物歸原位",
      "珍惜公共資源，最後一位離開學輔室的同學，務必確認室內無人並隨手關閉冷氣，並將冷氣遙控器放回原位。若屢次發現未關冷氣或隨意丟放遙控器，系學會將依規定暫停或取消冷氣使用權利。",
      "3. 外系同學使用規範",
      "學輔室空間資源「以圖資系學生優先」。若有外系同學陪同進入，請務必共同遵守本室所有規範，切勿喧嘩或影響本系同學權益；若經反映或屢勸不聽，系學會將禁止特定外系同學再次進入學輔室。",
      "美好的空間需要大家共同珍惜，感謝大家的配合與支持！"
    ],
    paragraphsEn: [
      "The student lounge is a shared space maintained by the LIS Student Association, offering comfortable air conditioning, locker rentals, and extended evening access before midterms and finals. We encourage all students to make use of this space! To maintain a high-quality study and discussion environment, please adhere to the following guidelines:",
      "1. Speak softly and respect others",
      "The student lounge is primarily intended for dining, resting, reading, and studying. If you need to discuss something, please keep your voice low and ensure that you do not disturb others, maintaining a quiet and focused environment.",
      "2. Turn off the air conditioning and return the remote control",
      "Cherish public resources. The last person to leave the student lounge must confirm that no one is inside and turn off the air conditioning, then return the remote control to its original place. If we repeatedly find that the air conditioning is not turned off or the remote control is discarded carelessly, the student association will suspend or cancel the right to use the air conditioning.",
      "3. Usage guidelines for students from other departments",
      "The student lounge's resources are 'prioritized for LIS students'. If students from other departments accompany you into the lounge, please ensure you both abide by all rules of this room, refraining from making noise or affecting the rights of LIS students; if complaints are received, the student association will ban specific students from other departments from entering the student lounge again."
    ],
    image: airconRules,
  },
  {
    slug: "locker",
    category: "行政部",
    categoryEn: "General Affairs",
    title: "系櫃清空與鑰匙歸還通知",
    titleEn: "Locker Clearance and Key Return Notice",
    author: "臺大圖資系學會",
    authorEn: "NTU LIS Student Association",
    date: "2026.10.17",
    excerpt: "為維護本學年繳交系學會費同學的權益，尚未繳 115 學年度系學會費的同學、也未登記系櫃，但仍在使用系櫃的同學，請於以下期限內歸還鑰匙並清空櫃子。",
    excerptEn: "To protect the rights of students who have paid the LISSA fee for this academic year, students who have not paid the 115th academic year LISSA fee and have not registered for a locker but are still using one must return their keys and clear their lockers by the following deadline.",
    paragraphs: [
      "【🔑系櫃清空與鑰匙歸還通知】 ",
      "為維護本學年繳交系學會費同學的權益，尚未繳 115 學年度系學會費、也未登記系櫃，但仍在使用系櫃的同學，請於以下期限內歸還鑰匙並清空櫃子。",
      "🕒 歸還鑰匙＆領回押金時段：",
      "10/21（三）、10/22（四）、10/23（五） 12:30 - 13:00",
      "🏫 地點：系館一樓學輔室",
      "⚠️ 10/23（五）前未清空者，系學會將統一清出物品，暫存學輔室至 10/30（五），期間不負保管責任，逾期視同放棄。",
      "若之後仍有需要租借系櫃，也歡迎登記系學會費繳交，即可享有系櫃免租金、學輔室預約、系服、小圖盃、之夜等各項活動折扣！",
    ],
    paragraphsEn: [
      "【🔑Locker Clearance and Key Return Notice】",
      "To protect the rights of students who have paid the LISSA fee for this academic year, students who have not paid the 115th academic year LISSA fee and have not registered for a locker but are still using one must return their keys and clear their lockers by the following deadline.",
      "🕒 Key return & deposit refund time:",
      "Wed 10/21, Thu 10/22, Fri 10/23, 12:30–13:00",
      "🏫 Location: Student Lounge, 1st Floor, Department Building",
      "⚠️ Students who do not clear their lockers by Fri 10/23 will have their items removed and temporarily stored in the Student Lounge until Fri 10/30. The association is not responsible for safekeeping during this period. Items left after this date will be considered abandoned.",
      "If you still need to rent a locker in the future, you are welcome to pay the LISSA fee to enjoy free locker rental, student lounge reservations, department apparel, small trophies, and discounts for various events!",
    ],
    image: lockerclearance,
  },
  {
    slug: "lounge-night-usage",
    category: "正副會長",
    categoryEn: "Presidents",
    title: "學輔室夜間使用申請",
    titleEn: "Apply for Evening Lounge Access",
    author: "臺大圖資系學會",
    authorEn: "NTU LIS Student Association",
    date: "2026.10.10",
    excerpt: "考前衝刺不孤單！",
    excerptEn: "You don't have to study alone!",
    paragraphs: [
      "系學會特別為大家向系辦爭取到期中（10/19–10/30）與期末（12/14–12/25）考前限定的學輔室夜間延長開放福利，時段為週一至週五 19:00 至 22:00；身為系學會費會員專屬福利，已繳費同學可 1 人起申請、上限 5 人一組，未繳費者亦能作為組員一同自修，但須由已繳費會員擔任主要申請人，請大家務必於使用日前一天中午 12:00 前完成表單預約，若需取消則請於使用當天中午 12:00 前來信 ntulissa1060@gmail.com 通知，快把握專屬空間與舒適環境，讓系學會陪伴你全力備戰、順利歐趴！",
    ],
    paragraphsEn: [
      "We've secured extended evening access to the student lounge from the department office for the weeks before midterms (10/19–10/30) and finals (12/14–12/25), Monday to Friday, 7–10 p.m. This is a members-only benefit: members can apply alone or in groups of up to 5, and non-members may join as group members as long as a member is the main applicant. Please book through the form by 12:00 noon the day before. To cancel, email ntulissa1060@gmail.com by 12:00 noon on the day. Make the most of this space — we're here to help you ace your exams!",
    ],
    image: loungeNightUsage,
  },
  {
    slug: "recruitment-2026",
    category: "學會公告",
    categoryEn: "Announcement",
    title: "第 53 屆系學會招募中",
    titleEn: "The 53rd LISSA Is Recruiting",
    author: "臺大圖資系學會",
    authorEn: "NTU LIS Student Association",
    date: "2026.09.08",
    excerpt: "加入我們，一起為圖資系的未來努力！",
    excerptEn: "Join us and help shape the future of LIS!",
    paragraphs: [
      "「圖資系學會到底在做什麼？」",
      "我們傾聽聲音、爭取福利，也包辦系上大小活動的策劃與執行。但最重要的是，我們想把這裡打造成大家最有歸屬感的地方。",
      "現在，我們需要你的加入，無論你是腦洞大開的點子王、負責的細節控、熱愛美感的設計人，還是單純想交新朋友，B15 系學會的五大部門，絕對有你發揮的舞台：",
      "🎸 活動部｜包辦系上各大小活動的籌備與執行，享受從幕後策劃到萬人響應的成就感！",
      "📖 學術部｜提前掌握課程資訊，策劃系友講座、企業參訪與杜鵑花節",
      "📂 行政部｜支撐系學會的最強後盾，掌管財務與空間，培養對內對外的溝通技能！",
      "🎨 形宣部｜負責社群帳號行銷與公關，用設計與排版包裝每一個精彩瞬間。",
      "🏀 體育部｜燃燒熱血與汗水，推廣運動風氣，凝聚系上向心力！",
      "我們會在招募結束後安排輕鬆的交流面試，期待能和你當面聊聊你的想法，若有任何對於職位的問題也非常歡迎直接私訊 IG 粉專或是留言於表單中呦 💬",
      "⏳ 招募期限：即日起至 9/30（三）23:59 截止",
      "👉 立刻掃描 Qrcode 或點擊主頁連結 🔗https://forms.gle/bCmHMEpPsKEKXqiP8，揪團填寫招募表單加入我們！",
      "這絕對是一段能讓你累積經驗、結識夥伴、發揮影響力的旅程，成就不一樣的圖資系，需要的就是你 🤝"
    ],
    paragraphsEn: [
      "\"So what does the LIS Student Association actually do?\"",
      "We listen to students, fight for benefits, and plan and run events big and small. Most of all, we want to make this a place where everyone feels they belong.",
      "Now we need you. Whether you're an idea machine, a detail person, a design lover or just want to make new friends, there's a place for you in one of our five departments:",
      "🎸 Events | Plan and run department events of every size — and feel the thrill of seeing your ideas come to life!",
      "📖 Academic Affairs | Get early insight into courses and organize alumni talks, company visits and the Azalea Festival.",
      "📂 General Affairs | The backbone of the association: manage finances and spaces, and build communication skills.",
      "🎨 Image & Publicity | Run our social media and public relations, and capture every great moment through design.",
      "🏀 Sports | Bring the energy, promote an active culture and bring the department together!",
      "After recruitment closes, we'll have a relaxed chat-style interview — we'd love to hear your ideas in person. Questions about any role? DM us on Instagram or leave a note in the form 💬",
      "⏳ Deadline: now until Wed 9/30, 11:59 p.m.",
      "👉 Scan the QR code or use the link 🔗https://forms.gle/bCmHMEpPsKEKXqiP8 — grab your friends and apply together!",
      "This is a journey to gain experience, meet great people and make a difference. A different kind of LIS starts with you 🤝",
    ],
    image: recruit2026,
    imageCaption: "第 53 屆系學會招募中（圖／形宣部 石馨予）",
    imageCaptionEn: "The 53rd LISSA is recruiting (Design: Image & Publicity dept.)",
  },
  {
    slug: "welcome2026",
    category: "學會公告",
    categoryEn: "Announcement",
    title: "給大一的一封信",
    titleEn: "A Letter to Our Freshmen",
    author: "會長 黃子芸",
    authorEn: "President Tzu-Yun Huang",
    date: "2026.08.15",
    excerpt: "各位親愛的 B15 同學們好：",
    excerptEn: "Dear B15 freshmen,",
    paragraphs: [
      "我們是第 53 屆臺大圖書資訊學系學生會，恭喜大家成功上岸，踏上全新的求學旅程！系學會在此來信提醒大家一些必須留意的重要資訊與系上活動，若對於信中的內容、新生行政事務、大學生活或圖資系有任何疑問，歡迎大家追蹤並私訊系學會 Instagram 帳號，以獲取更多系上活動通知！",
      "・入學重要時程與選課：",
      "請於 8/3 起啟用計中帳號與 NTU Webmail，並在 8/3 至 9/4 間完成學雜費繳納與線上註冊。學分抵免與基礎學科免修考試報名皆於 8/19 截止，大一英文免修則開放至 9/8。宿舍申請期間為 8/12 至 8/20。115-1 課程選填共分預選（8/3～8/18）、一階（8/19～8/22）與二階（8/25～8/27），建議搭配學術部製作的選課懶人包與課程地圖填選。最後請於 8/18 至 8/20 填寫英文姓名，並於 8/28 或 8/31 至 9/3 前往保健中心完成新生健檢。",
      "・新生專屬活動：",
      "五系聯合宿營（圖資 x 機械 x 歷史 x 園藝 x 工海）將於 9/1 至 9/3 於新北坪林登場，報名至 8/27 截止，是認識同儕與學長姐的最佳機會；新生學習入門書院亦將於 9/2 至 9/3 舉行，鼓勵各位學弟妹踴躍報名！",
      "祝大家開展精彩的大學旅程，我們開學見！"
    ],
    paragraphsEn: [
      "We're the 53rd Student Association of the Department of Library and Information Science at NTU. Congratulations on getting in and starting a brand-new chapter! This letter covers some important information and upcoming department events. If you have any questions about this letter, freshman admin, university life or LIS, follow and DM us on Instagram for more updates!",
      "・Key enrollment dates and course selection:",
      "Activate your Computer Center account and NTU Webmail from 8/3, and pay tuition and complete online registration between 8/3 and 9/4. Credit transfer and basic-subject exemption exam registration both close on 8/19; freshman English exemption is open until 9/8. Dorm applications run from 8/12 to 8/20. Course selection for Fall 2026 has a pre-selection round (8/3–8/18), Round 1 (8/19–8/22) and Round 2 (8/25–8/27) — we recommend using the course guide made by our Academic team together with the course map. Finally, fill in your English name between 8/18 and 8/20, and complete your freshman health check at the Health Center on 8/28 or between 8/31 and 9/3.",
      "・Freshman events:",
      "The five-department joint camp (LIS × Mechanical Engineering × History × Horticulture × Engineering Science and Ocean Engineering) takes place in Pinglin, New Taipei, from 9/1 to 9/3 — registration closes on 8/27, and it's the best way to meet classmates and seniors. The Freshman Learning Academy also runs from 9/2 to 9/3. We encourage everyone to sign up!",
      "Wishing you an amazing start to university — see you when classes begin!",
    ],
    image: welcome2026,
  },
  {
    slug: "term-53-inauguration",
    category: "學會公告",
    categoryEn: "Announcement",
    title: "第 53 屆系學會上任公告",
    titleEn: "The 53rd LISSA Takes Office",
    author: "臺大圖資系學會",
    authorEn: "NTU LIS Student Association",
    date: "2026.08.12",
    excerpt: "臺大圖資系學會已於 7 月 30 日完成新舊團隊交接，第 53 屆正副會長黃子芸與洪聆雅團隊正式接任。",
    excerptEn: "The handover was completed on July 30, and the 53rd team led by President Tzu-Yun Huang and Vice President Ling-Ya Hung has officially taken office.",
    paragraphs: [
      "臺大圖資系學會已於 7 月 30 日順利完成交接，第 53 屆正副會長黃子芸與洪聆雅團隊正式接任，展開新學年的營運與服務。",
      "兩位正副會長在前一屆團隊中即擔任核心要職，深度參與會務運作，並在停辦四年之久、重磅回歸的「2026 圖資之夜」等重大專案中累積了扎實的實戰與籌備經驗。",
      "站在成熟的運作基礎上，第 53 屆系學會將全力推動學會品牌化。新團隊期望透過更具識別度的品牌視覺、全新官方網站的誕生，以及選課攻略等實用工具的整合，推動更多「看得到、摸得著」的具體工作，讓系學會的各項服務深度融入日常生活，使每位圖資人在大學四年中都能強烈感受到系學會的陪伴與存在。",
      "臺大圖資系學會絕非封閉運作的學生自治組織，而是真正屬於「全體圖資人的系學會」。新團隊將突破傳統框架、勇於嘗試與創新，推動更多兼具實質效益與多元趣味的專案，顛覆大家對自治組織的既定想像，讓所有人看見系學會原來真的可以這樣「玩」！"
    ],
    paragraphsEn: [
      "The NTU LIS Student Association completed its handover on July 30. The 53rd team, led by President Tzu-Yun Huang and Vice President Ling-Ya Hung, has officially taken office and begun the new academic year.",
      "Both held key roles on the previous team and were deeply involved in running the association, gaining solid hands-on experience through major projects such as LIS Night 2026 — revived after four years.",
      "Building on this foundation, the 53rd association will focus on building the LISSA brand: a more recognizable visual identity, a brand-new official website, and practical tools such as course selection guides. The goal is more work you can actually see and use, so that our services become part of everyday life and every LIS student feels our presence throughout university.",
      "The NTU LIS Student Association isn't a closed organization — it truly belongs to every LIS student. The new team will break with convention, try new things and launch projects that are both useful and fun, showing everyone that a student association really can be played like this!",
    ],
    image: inaugurationPhoto, // ★換成你的照片：改最上面的 import；這篇不想要圖就把這行刪掉
    imageCaption: "第 52 屆會長曾柏翰（左）與第 53 屆會長黃子芸（右），於系主任羅思嘉教授（中）見證下順利完成印信交接儀式。（圖／臺大圖資系學會）",
    imageCaptionEn: "52nd President Po-Han Tseng (left) hands over the official seal to 53rd President Tzu-Yun Huang (right), witnessed by Department Chair Prof. Szu-Chia Lo (center). (Photo: NTU LISSA)",
  },

  {
    slug: "term-52-farewell",
    category: "學會公告",
    categoryEn: "Announcement",
    title: "第 52 屆系學會卸任公告",
    titleEn: "Farewell from the 52nd LISSA",
    author: "",
    date: "2026.07.30",
    excerpt: "隨著新舊任期交接完成，國立臺灣大學圖書資訊學系第 52 屆系學會正式卸下職務。",
    excerptEn: "With the handover complete, the 52nd Student Association of NTU LIS has officially stepped down.",
    paragraphs: [
      "隨著新舊任期交接完成，國立臺灣大學圖書資訊學系第 52 屆系學會正式卸下職務。",
      "回首這一年，第 52 屆系學會由會長曾柏翰帶領，以打造「不一樣的系學會」為核心願景，重新回歸由大三學生擔任會長領導的傳統，以更成熟的歷練投入系務運作。團隊始終致力於讓系學會的服務真正「看得見、用得到」，不僅成功爭取開放學輔室冷氣使用權限、建立系生交流版社群，更回應系上長久以來的期盼，成功復辦睽違四年的盛大盛事——「2026 圖資之夜」，為圖資人留下深刻的共同回憶。",
      "在組織革新方面，本屆推動大幅度的結構優化：將傳統的公關、行宣與美宣整併為專業化的「形象宣傳部」，並獨立出專責財務與空間庶務的「行政部」；同時廣納大一新血，將工作團隊擴充至 40 人規模，讓每位同學都能在組織中發揮所長、找到屬於自己的舞台。此外，團隊亦積極扮演學生與教職員間的溝通橋樑，深化與教授群的連結，爭取更多師長參與系上事務與指導。",
      "感謝全體圖資系師生這一年來的信任、參與與支持。第 52 屆系學會全體成員正式交棒，願這份求新求變的能量持續延續，也預祝新一屆系學會帶領圖資系邁向更精彩的下一章！"
    ],
    paragraphsEn: [
      "With the handover complete, the 52nd Student Association of the Department of Library and Information Science at NTU has officially stepped down.",
      "Looking back on the year, the 52nd association, led by President Po-Han Tseng, set out to build \"a different kind of student association\" and returned to the tradition of a junior-year president. The team worked to make our services truly visible and useful: opening the lounge air conditioning, creating a student community board, and — answering a long-standing wish — reviving LIS Night 2026 after four years, leaving lasting shared memories.",
      "Organizationally, this term made major structural changes: merging public relations, promotion and design into a professional Image & Publicity department, and creating a dedicated General Affairs department for finances and spaces. It also welcomed many freshmen, growing the team to 40 people so that everyone could find their own stage. The team also acted as a bridge between students and faculty, strengthening ties with professors and inviting more of them to take part.",
      "Thank you to all LIS students and faculty for your trust, participation and support this year. The 52nd association now passes the baton — may this spirit of change carry on, and we wish the new association an even more exciting next chapter for LIS!",
    ],
    image: farewell52image, // ★換成你的照片：改最上面的 import；這篇不想要圖就把這行刪掉
  },
  {
    slug: "term-53-election-result",
    category: "學會公告",
    categoryEn: "Announcement",
    title: "第 53 屆正副會長選舉結果",
    titleEn: "53rd Presidential Election Results",
    author: "",
    date: "2026.06.01",
    excerpt: "本會於本月 1 日進行正副會長改選，由圖資二黃子芸、圖資二洪聆雅當選。",
    excerptEn: "In the election held on June 1, sophomores Tzu-Yun Huang and Ling-Ya Hung were elected President and Vice President.",
    paragraphs: [
      "國立臺灣大學圖書資訊學系第 53 屆正副會長選舉已於 2026 年 6 月 1 日完成投票與開票作業。本次選舉由 1 號候選人組合黃子芸（會長候選人）與洪聆雅（副會長候選人）登記參選，開票統計結果如下：",
      "・選舉人數：245 人",
      "・投票人數：48 人（投票率：20%）",
      "・有效票數：47 票",
      "・無效票數：1 票",
      "・同意票：41 票",
      "・不同意票：6 票",

      "本次選舉投票率達 20%，符合「投票率達 15% 以上」之法定要件；且同意票多於不同意票，1 號候選人黃子芸、洪聆雅正式當選為國立臺灣大學圖書資訊學系第 53 屆系學會正副會長。",
      "感謝所有參與本次投票、行使自治權利的系上同學，也預祝新任正副會長順利展開新學年的系務推動！",
    ],
    paragraphsEn: [
      "Voting and counting for the 53rd presidential election of the NTU LIS Student Association were completed on June 1, 2026. Ticket No. 1 — Tzu-Yun Huang (President) and Ling-Ya Hung (Vice President) — ran in this election. The results are as follows:",
      "・Eligible voters: 245",
      "・Ballots cast: 48 (turnout: 20%)",
      "・Valid votes: 47",
      "・Invalid votes: 1",
      "・Yes: 41",
      "・No: 6",
      "Turnout reached 20%, meeting the required threshold of 15%, and Yes votes outnumbered No votes. Ticket No. 1, Tzu-Yun Huang and Ling-Ya Hung, are therefore officially elected President and Vice President of the 53rd NTU LIS Student Association.",
      "Thank you to everyone who voted and exercised their right to self-governance. We wish the new President and Vice President a successful year!",
    ],
      image: election2026,
      imageCaption: "第 53 屆系學會正副會長選舉結果（圖／臺大圖資系學會選委會）",
      imageCaptionEn: "53rd presidential election results (Graphic: NTU LISSA Election Committee)",


  },
];

// 依 slug 找出某一篇公告（文章頁用）。
export function getAnnouncement(slug: string): Announcement | undefined {
  return ANNOUNCEMENTS.find((a) => a.slug === slug);
}