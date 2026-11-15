# AGENTS.md — 臺大圖資系學會官方網站（NTU LIS SA Official Site）

> 這份文件寫給「之後接手這個專案的 AI 協作者」看。
> 讀完之後，你應該知道：這個網站是做什麼的、長什麼樣子、檔案放哪裡、要新增內容該改哪些檔案，以及哪些事情絕對不能做。
> 有疑問時，**以現有程式碼的寫法為準**，不要自己發明新的模式。

---

## 0. 給 AI 的第一條規則：怎麼跟這位使用者溝通

- **一律用繁體中文（臺灣用語）回覆**。使用者的母語是中文，英文不流利。
- 使用者**不太會寫程式**，你是「共同開發者」：
  - 修改後要交出「**完整、可直接覆蓋的檔案**」，不要只給片段或 diff，除非使用者要求。
  - 每次修改都要說清楚：**改了哪個檔案（完整路徑）、改了什麼、為什麼**。
  - 程式碼註解用**中文**寫，風格比照現有檔案（見第 7 節）。
- 遇到設計決策（字體、顏色、版面、UX 流程）不確定時，**先問再做**；使用者會提供 Figma 截圖與 UX 流程說明。
- 使用者說「改 A」，就只改 A。不要順手重構、重新命名、搬檔案或「優化」沒被要求的地方。

---

## 1. 專案目的

這是**國立臺灣大學圖書資訊學系系學會**（臺大圖資系學會／NTU LIS SA／LISSA）的官方網站，正式網址 `https://www.ntulissa.com`。

網站要做到：

1. **資訊集中**：公告、行事曆、各部門服務、系學會費、聯絡方式、加入招募，全部在一個地方找到，不再只靠 IG 零散貼文。
2. **展現圖資專業**：UI/UX 與資訊架構是圖資系的核心專業，網站本身就是「學以致用」的作品，品質要經得起檢驗。
3. **傳承與紀錄**：「歷任會長」「現任團隊」頁面要好好記錄每一屆、每一位付出過的夥伴。
4. **可被搜尋**：Google 搜尋「臺大圖資系學會」要能找到；每一頁都有自己的標題、描述與分享預覽（SEO）。
5. **雙語**：繁體中文為主、英文為輔，所有頁面都要能切換。
6. **全裝置可用**：電腦、平板（iPad）、手機都要好看好用，自動切換版面。

主要讀者：圖資系在學學生（含大一新生）、想認識圖資系的高中生、系友、合作／贊助單位。

---

## 2. 技術架構

| 項目 | 使用的東西 |
|---|---|
| 框架 | React 18 + TypeScript |
| 建置工具 | Vite 6 |
| 樣式 | Tailwind CSS 4（`@tailwindcss/vite`）＋ 行內 `style={{}}` |
| 圖示 | `lucide-react` |
| 動畫 | Tailwind transition、`motion`、自製 `Reveal`／`useScrollReveal` |
| 路由 | **自製**（`src/ui/general/routing.ts`），沒有用 react-router 的 Router |
| 多語系 | **自製**（`src/ui/i18n/`），沒有用 i18next |
| SEO | `src/seo/seo.ts` ＋ build 時預先產生每頁 HTML（`scripts/prerender-seo.mjs`） |
| 部署 | Vercel（`vercel.json`），Node 24.x |

常用指令：

```bash
npm run dev        # 開發模式（port 3000）
npm run build      # 正式建置（含 SEO 預先產生 HTML）
npm run typecheck  # 型別檢查，改完程式一定要過
```

> `package.json` 裡有很多 Radix、MUI 等套件，但**新功能請優先用現有的自製元件與 Tailwind**，不要為了一個小功能引入新的 UI 套件。要新增套件前先問使用者。

---

## 3. 網頁整體風格（Design Language）

### 3.1 氛圍
- **深色、極簡、現代、有質感**。整站黑底白字，像一個設計作品集網站，而不是傳統學校公告欄。
- 大量留白、大字標題、卡片式排版、細邊框、柔和的 hover 效果。
- 內容進入畫面時淡入上滑（`<Reveal>`）。

### 3.2 顏色

**基底**

| 用途 | 色碼 |
|---|---|
| 整站背景 | `#000000`（`bg-black`） |
| Header 捲動後背景 | `#090909` 90% 透明 ＋ `backdrop-blur-xl` |
| 下拉選單面板 | `#111` 95% 透明 |
| `theme-color`（手機網址列） | `#060606` |
| 主要文字 | 白色；次要文字用 `text-white/55`～`text-white/80` |
| 邊框 | `border-white/10`，hover 時 `border-white/20` |
| 卡片底 | `rgba(255,255,255,0.04)` |

**品牌主色（紅→藍漸層）**

- 紅 `#D14B4B` → 藍 `#2F9EBD`
- 用在：「加入我們」按鈕的漸層描邊＋旋轉光暈、手機選單的分類小標、重點強調。
- 這是全站最重要的品牌識別，**不要換色、不要濫用**（一個畫面通常只出現一兩處）。

**部門色**（每個部門有固定代表色，跨頁一致）

| key | 部門 | 行事曆／服務頁用色（`events.ts`、`servicesData.ts`） | 部門頁／歷任會長用色（`departments.ts`、`presidents.ts`） |
|---|---|---|---|
| `pres` | 正副會長 | `#A27F00` | 副會長 `#C2A23A` |
| `gen` | 行政部 | `#915E3E` | `#B07C43` |
| `eve` | 活動部 | `#9F353A` | `#C24A4F` |
| `aca` | 學術部 | `#42602D` | `#5E8C3C` |
| `ima` | 形象宣傳部 | `#572A3F` | `#9C4A6E` |
| `sp` | 體育部 | `#23658A` | `#23658A` |
| `school` | 學校日程 | `#FFFFFF` | — |

> ⚠ 目前有「深色版」和「亮色版」兩套部門色，分別用在不同頁面，這是**刻意的**（深色版當大面積底色、亮色版當外框和文字）。**不要自行統一**；新頁面請沿用「同類型頁面」的那一套，不確定就問。
> 跨多個部門的活動一律用正副會長黃（`LEAD_COLOR`）。

### 3.3 字體

| 用途 | 字體 |
|---|---|
| 大標題、數字、按鈕、重點文字（display） | `'Chiron Hei HK Text', 'Noto Sans TC', sans-serif` |
| 內文、導覽列 | `'Noto Sans TC', sans-serif` |
| 小標籤、英文裝飾字、頁面小標題（eyebrow） | `'Ubuntu Sans Mono', monospace`（`shared.tsx` 有 `monoSemi`／`monoMed`／`monoBold`） |
| 背景草寫裝飾 | `'Dancing Script', cursive`（只在少數頁面當浮水印） |

在每個元件檔案上方這樣宣告（沿用現有命名）：

```ts
const zhDisplay = "'Chiron Hei HK Text', 'Noto Sans TC', sans-serif";
const zhFont = "'Noto Sans TC', sans-serif";
const monoFont = "'Ubuntu Sans Mono', monospace";
```

### 3.4 字距規則（很重要）
- **中文字距要拉開**（常見 `0.06em`～`0.32em`），**英文字距要收緊**（約 `0.02em`），英文拉太開會很難讀。
- 用 `useI18n()` 的 `track(中文字距, 英文字距)` 自動切換：`letterSpacing: track("0.3em")`。

### 3.5 常見元件樣式
- **主要按鈕**：白底黑字膠囊 `bg-white text-black rounded-full px-6 py-3`，右側 `ArrowRight` 圖示，hover 時箭頭右移。
- **加入我們按鈕**：黑底＋紅藍漸層描邊＋8 秒旋轉光暈（`JoinButtonBorder`，在 `Header.tsx`）。
- **卡片**：`shared.tsx` 的 `cardBase`（圓角 2xl、細白邊、極淡白底）。
- **膠囊標籤**：`rounded-full`，部門色圓點＋hover 時文字往右滑出。
- **頁面小標題（eyebrow）**：每個獨立頁左上角的「— 關於我們・現任團隊」，一律用 `<PageEyebrow title="..." />`。
- **英文大寫裝飾字**：例如服務的 `en: "LOCKER RENTAL"`、部門的 `en: "GENERAL AFFAIRS"`，中英文版**都會顯示**，當作視覺裝飾。

### 3.6 RWD（響應式）規則
- 斷點：**≥ 1024px 是電腦版**（等同 Tailwind `lg:`），以下是平板／手機。
- **原則：電腦版是設計稿原樣，改手機版時絕對不能動到電腦版的數值。**
  寫法：`const isDesktop = useIsDesktop();` → `isDesktop ? 原本的值 : 手機平板的值`。
- 標題要「**字體縮小優先、不要換行**」：用 `shared.tsx` 的 `fitText()` 或 `fitLine()`。
- 左右邊距統一用 `pageTitles.ts` 的 `SITE_GUTTER`（手機 20px／平板以上 32px）。
- Header 選單：≥ 1024px 顯示桌機下拉選單；以下顯示漢堡選單。語言切換按鈕在手機版直接放在 Header 上。
- 新元件至少要在 **375px（手機）、768px（iPad 直向）、1024px、1440px** 四種寬度下看起來正常。

### 3.7 文案語氣
- 中文：熱情、有溫度、活潑，常用「圖資人」「系胞」「系學會」「學輔室」等系上用語，可以用驚嘆號和少量 emoji（公告內文）。
- 英文：自然簡潔的英文，不要逐字直翻；部門英文名稱固定為 `General Affairs`／`Events`／`Academic Affairs`／`Image & Publicity`／`Sports`，不要另創譯名；姓名用**威妥瑪拼音、名在前姓在後**（例：`Po-Han, Tseng`、`TZU-YUN, HUANG`）。
- 系級寫法：`B14`、`B15`（學號前綴）；學年用民國（如 `115 學年度`）；屆數用「第 53 屆」。
- 日期格式依資料檔規定（見第 5 節），不要混用。

---

## 4. 頁面結構

### 4.1 版面骨架
每一頁都是：`<Header />`（固定在最上方）→ 頁面內容 → `<Footer />`。
由 `src/ui/general/App.tsx` 依照目前網址決定要顯示哪一頁。

### 4.2 首頁（`/`，捲動式）
由上到下：

1. `Hero` — 主視覺
2. `AnnouncementSearch` — 公告搜尋（讓人一進來就找得到公告）
3. `AboutUs` — 學會簡介
4. `Upcoming` — 近期活動卡片（自動抓 `events.ts` 最近 5 場）
5. `Lounge` — 學輔室
6. `SportsTeam` — 系隊
7. `Dashboard` — 資訊總覽

### 4.3 所有分頁（網址一覽）

英文版網址前面加 `/en`（例：`/en/news`）。

| 網址 | 頁面 | 元件 | 導覽列分類 |
|---|---|---|---|
| `/` | 首頁 | 見上 | — |
| `/overview` | 資訊總覽 | `Dashboard standalone` | 關於我們 |
| `/about` | 學會簡介 | `AboutUs` | 關於我們 |
| `/current-team` | 現任團隊 | `Team standalone` | 關於我們 |
| `/presidents` | 歷任會長 | `Presidents` | 關於我們 |
| `/dept/<slug>` | 部門頁（`gen`/`eve`/`aca`/`ima`/`sp`） | `Department` | — |
| `/news` | 公告列表 | `News standalone` | 最新消息 |
| `/news/<slug>` | 單篇公告 | `Article` | — |
| `/calendar` | 行事曆 | `Calendar` | 最新消息 |
| `/lis-cup` | 小圖盃賽程（`?sport=volleyball`） | `LIScup` | — |
| `/services` | 各部業務 Bento 總覽 | `Services` | 服務 |
| `/service/<slug>` | 單一服務詳情 | `Services slug=...` | — |
| `/resources` | 學習資源 | `Sources` | 服務 |
| `/contact` | 聯絡我們 | `Contact` | 服務 |
| `/fees` | 系學會費 | `Fee` | 支持我們 |
| `/sponsor` | 贊助我們 | `Sponsor` | 支持我們 |
| `/join` | 加入我們 | `Recruit` | 「加入我們」按鈕 |
| `/dept-quiz` | 部門適性測驗 | `Survey` | — |

找不到的網址一律顯示首頁。

### 4.4 站內連結寫法
- 元件裡的站內連結**一律寫 `href="#/news"`、`href="#/service/locker"` 這種舊格式**，`App.tsx` 會自動轉成 `/news` 或 `/en/news`，語言會自動帶上。
- 首頁錨點寫 `href="#team"`。
- 外部網址、`mailto:`、`tel:` 會自動另開新分頁，不用自己加 `target="_blank"`。
- 程式裡要換頁用 `navigate("/news")`（從 `routing.ts` 匯入），**不要用 `window.location.href = ...`**（會整頁重新整理）。

---

## 5. 新增內容時要遵守的格式

> 核心觀念：**內容（資料）和版型（元件）分開。** 大部分「新增內容」只需要改 `.ts` 資料檔，**不要動 `.tsx` 元件**。

### 5.1 新增公告 → `src/ui/latest/news.ts`

在 `ANNOUNCEMENTS` 陣列**最上面**加一筆（陣列由新到舊）：

```ts
{
  slug: "lis-night-2027",          // 網址代稱：只用小寫英數和 -，全站不可重複
  category: "活動部",               // 標籤：學會公告／正副會長／行政部／活動部／學術部／形象宣傳部／體育部
  categoryEn: "Events",
  title: "2027 圖資之夜開放報名",
  titleEn: "LIS Night 2027 Registration Opens",
  author: "臺大圖資系學會",          // 沒有就填 ""
  authorEn: "NTU LIS Student Association",
  date: "2027.03.01",               // ★ 格式 YYYY.MM.DD
  excerpt: "列表卡片上的一句摘要（建議 30 字以上，會拿來當 Google 描述）",
  excerptEn: "...",
  paragraphs: ["第一段", "第二段"],  // 一段一個字串
  paragraphsEn: ["Paragraph 1", "Paragraph 2"],
  image: lisNight2027,              // 先在檔案最上方 import；不要圖就整行刪掉
  imageCaption: "圖說（圖／形宣部）",
  imageCaptionEn: "Caption (Image: Image & Publicity dept.)",
},
```

- 圖片放 `src/imports/latest/`，在檔案最上方 `import xxx from "@/imports/latest/檔名.png";`
- SEO（標題、描述、sitemap）會**自動**從這裡產生，不用另外改 `seo.ts`。

### 5.2 新增活動 → `src/ui/latest/events.ts`

在 `EVENTS` 陣列加一筆（順序不拘，會自動排序）：

```ts
{
  title: "聖誕大會 2026",
  titleEn: "Christmas Party 2026",
  date: "2026-12-18",            // ★ 格式 YYYY-MM-DD（注意：和公告的 YYYY.MM.DD 不同）
  // end: "2026-12-19",          // 連續多天才填（含當天）
  // moreDates: ["2026-12-25"],  // 不相連的多天才填，不要和 end 同時用
  time: "18:30",                 // 24 小時制，可省略
  depts: ["eve"],                // 部門 key，可多個；學校日程用 ["school"]
  service: "xmas",               // 對應 servicesData.ts 的 slug（決定首頁卡片的圖與顏色）
  // image: "xmas-2026.png",     // 專屬卡片圖，放 src/imports/home-page/events/
  location: "系館視聽室",
  locationEn: "Lecture Room, LIS Dept. Building",
  mapUrl: "https://maps.app.goo.gl/...",
  desc: "第一行\n第二行",          // 用 \n 換行
  descEn: "Line 1\nLine 2",
  signup: true,
  signupUrl: "https://forms.gle/...",
},
```

### 5.3 新增／修改服務 → `src/ui/services/servicesData.ts`

- 這是**單一資料來源**：`/services` Bento 總覽、`/service/<slug>` 詳情頁、`/dept/<slug>` 部門頁輪播、SEO 全部吃這一份。
- 新增服務格需要設定 `gc`／`gr`（12 欄 × 8 列的 CSS grid 位置），**會影響整個 Bento 拼圖排版**，新增或改位置前一定要先問使用者。
- 圖片以 slug 命名放 `src/imports/services/`（可放子資料夾如 `IMG-gen/`），程式會自動找到。
- `note: false` ＝不顯示便利貼；沒有 `href` ＝顯示「準備中」；沒有 `guide` ＝不顯示翻牌按鈕。

### 5.4 更新部門成員 → `src/ui/about-us/departments.ts`

- 幹部 `heads`：`{ name, nameEn, cls, title, titleEn, img: memImg("gen1"), photo?: { y, zoom } }`
- 部員 `members`：`{ n: "中文名", nEn: "Given-Name, Surname", c: "B15" }`
- 幹部照片：去背 PNG，放 `src/imports/about-us/members/`，檔名 `<部門key><編號>.png`（如 `gen1.png`）。
- 部門 hashtag：同檔 `DEPT_HASHTAGS`／`DEPT_HASHTAGS_EN`（不用寫 `#`）。

### 5.5 新增一屆會長（每年交接） → `src/ui/about-us/presidents.ts`

1. 照 `P53` 的寫法建立新常數（如 `P54`）。
2. 放到 `PRESIDENTS` 陣列**第一個**（陣列由新到舊，第一個＝現任）。
3. 照片放 `src/imports/about-us/presidents/54pres.png` 並在檔案上方 import。
4. 有選舉票數就填 `election`；查無票數只填 `candidates`。
5. 同時記得：`departments.ts` 換成新團隊名單、`news.ts` 加交接公告。

### 5.6 介面文字（按鈕、選單、標題）

- **全站共用**的文字（導覽列、頁面小標題、Footer）→ `src/ui/i18n/locales/zh-TW.ts` 和 `en.ts`，**兩個檔案的結構必須一模一樣**。
- **某一頁專用**的文字 → 寫在該頁檔案最上方：

```ts
const TEXT = defineText({
  zh: { title: "加入我們", button: "立即報名" },
  en: { title: "Join Us", button: "Apply now" },
});
// 元件裡：const { pick } = useI18n(); const tx = pick(TEXT);
```

- **資料檔**的英文：在中文欄位旁加「同名＋En」欄位（`title` → `titleEn`），畫面用 `localize()` 取用；沒填英文會先顯示中文，網站不會壞。
- **禁止**把中文或英文字串直接寫死在 JSX 裡（例：`<h1>關於我們</h1>`）。

### 5.7 新增一個全新分頁（需要改的地方，缺一不可）

1. `src/ui/general/routing.ts`
   - `Route` 型別加一項
   - 沒有參數的頁面：加進 `STATIC_ROUTE_NAMES`
   - 有參數的頁面：改 `parseRoute()` 和 `routeToPath()`
   - 檔案最上方的「所有分頁一覽」註解也要加
2. `src/ui/general/App.tsx` — 在 route 判斷裡加一個分支，顯示新元件
3. `src/seo/seo.ts`
   - `PAGE_TEXT["zh-TW"].pages` 和 `PAGE_TEXT.en.pages` 都要加標題與描述
   - `allRoutes()` 的 `fixed` 清單要加（否則 build 不會產生這頁的 HTML，Google 抓不到）
4. `src/ui/i18n/locales/zh-TW.ts`、`en.ts` — `pageTitles`（頁面小標題）、需要的話加 `nav`
5. `src/ui/general/Header.tsx` 的 `getNavItems()` — 如果要出現在導覽列
6. 新元件檔：頂部用 `<PageEyebrow title="..." />`，內容上內距用 `pt-[var(--page-content-top)]`

---

## 6. 檔案命名與放置規則

### 6.1 資料夾結構

```
project-root/
├── index.html                 # SEO 區塊（seo:start ~ seo:end 註解不可刪）、結構化資料
├── package.json
├── vercel.json
├── scripts/prerender-seo.mjs  # build 時幫每一頁產生 HTML
├── public/                    # favicon、apple-touch-icon、分享預覽圖
└── src/
    ├── main.tsx
    ├── globals.css            # 含 --page-content-top 等全域變數
    ├── seo/
    │   ├── seo.ts             # 每頁標題、描述、canonical、OG（不可 import React 元件）
    │   └── prerender-entry.ts
    ├── imports/               # 所有圖片素材（依頁面分類）
    │   ├── general/header/
    │   ├── home-page/events/
    │   ├── about-us/members/
    │   ├── about-us/presidents/
    │   ├── latest/
    │   └── services/（可再分 IMG-gen/ 等子資料夾）
    └── ui/
        ├── general/           # 全站共用：App、Header、Footer、shared、routing、pageTitles、ScrollIndicator
        ├── i18n/              # index.tsx、LanguageSwitcher.tsx、locales/zh-TW.ts、locales/en.ts
        ├── home-page/         # 首頁各區塊：Hero、AnnouncementSearch、Upcoming、Lounge、SportsTeam
        ├── about-us/          # AboutUs、Dashboard、Team、Presidents、Department ＋ 資料檔
        ├── latest/            # News、Article、Calendar、LIScup、newsSearch ＋ news.ts、events.ts
        ├── services/          # Services、Contact、Sources ＋ servicesData.ts
        ├── join-us/           # Recruit、Survey
        └── support-us/        # Fee、Sponsor
```

> 資料夾分類＝**導覽列的分類**（關於我們／最新消息／服務／加入／支持）。新頁面放進對應分類的資料夾。

### 6.2 命名規則

| 類型 | 規則 | 範例 |
|---|---|---|
| React 元件檔 | PascalCase `.tsx` | `Calendar.tsx`、`Department.tsx` |
| 資料檔 | camelCase `.ts` | `news.ts`、`events.ts`、`servicesData.ts`、`presidents.ts` |
| 共用工具 | camelCase `.ts`／`.tsx` | `routing.ts`、`shared.tsx`、`deptShared.tsx` |
| 網址 slug | 小寫英數＋連字號 | `lis-cup-2026-badminton`、`term-53-inauguration` |
| 部門 key | 固定縮寫 | `pres` `gen` `eve` `aca` `ima` `sp` `school` |
| 服務圖片 | `<服務slug>.png` | `locker.png`、`lis-night.png` |
| 幹部照片 | `<部門key><編號>.png` | `gen1.png`、`eve2.png` |
| 會長照片 | `<屆數>pres.png` | `53pres.png` |
| 常數 | 全大寫底線 | `DEPT_COLORS`、`LOGO_SIZE`、`HEAD_POS` |

### 6.3 注意事項
- `src/ui/latest/` 裡同時有 `News.tsx`（元件）和 `news.ts`（資料），**import 資料時要寫明 `.ts`**（`"../ui/latest/news.ts"`），否則 Mac（不分大小寫）可能抓錯檔案。
- 圖片用 `@/imports/...` 路徑 import；`import.meta.glob` 自動掃描的地方用相對路徑（見 `deptShared.tsx`）。
- 新增圖片後畫面沒更新 → 重啟 dev server（glob 在啟動時掃描）。

---

## 7. AI 修改或新增內容時必須遵守的規則

### 7.1 一定要做
1. **先讀再改**：修改任何檔案前，先讀過它和相關檔案（資料檔、`shared.tsx`、`routing.ts`、`i18n/index.tsx`）。
2. **雙語同步**：新增任何看得到的文字，**中英文都要寫**。英文暫時寫不出來，也要留 `xxxEn` 欄位並告知使用者。
3. **RWD 同步**：新增或修改版面，要同時處理電腦版與手機版；用 `useIsDesktop()` 分流，**電腦版數值保持原樣**。
4. **SEO 同步**：新增分頁要改 `seo.ts`（見 5.7）。
5. **沿用共用工具**：`Reveal`、`PageEyebrow`、`cardBase`、`fitText`／`fitLine`、`useIsDesktop`、`useI18n`、`navigate`、`localize`、`defineText`。不要重新發明一樣的東西。
6. **可調參數集中**：版面上需要微調的數字（位置、大小、透明度），比照現有寫法放在檔案上方的「★ 可調整常數區」，加上中文註解說明「正值往哪裡移」，讓使用者自己能改。
7. **中文註解**：比照現有風格，用 `// ══════`、`// ── 標題 ──` 分隔區塊，`★` 標示重點、`⚠` 標示陷阱。資料檔最上方要有「欄位說明」。
8. **跑型別檢查**：改完要能通過 `npm run typecheck`。
9. **說明改動**：回覆時列出改了哪些檔案（完整路徑）、每個檔案改了什麼。

### 7.2 絕對不要做
1. ❌ 不要更換整體配色、字體、品牌紅藍漸層，除非使用者明確要求。
2. ❌ 不要把字串寫死在 JSX 裡（要走 i18n）。
3. ❌ 不要引入新的路由套件、i18n 套件、CSS 框架或 UI 元件庫。
4. ❌ 不要刪除或改名現有的 slug（會讓已經分享出去的網址失效、Google 收錄斷掉）。真的要改，先問使用者。
5. ❌ 不要刪掉 `index.html` 的 `<!-- seo:start -->`／`<!-- seo:end -->` 註解。
6. ❌ 不要在 `seo.ts` 裡 import React 元件（build 時在 Node 執行會壞掉）。
7. ❌ 不要在 `<PageEyebrow>` 外面包 `<Reveal>`（transform 會讓標題跑位）。
8. ❌ 不要用 `window.location.href` 做站內換頁、不要自己加外部連結的 `target="_blank"`（App.tsx 會統一處理）。
9. ❌ 不要捏造內容：活動日期、地點、人名、票數、報名連結都必須來自使用者提供的資料。不知道就留空或用 `// TODO:` 註解並告知使用者。
10. ❌ 不要使用受版權保護的圖片、角色或他校／他人品牌素材。
11. ❌ 不要擅自調整 Bento 格子位置（`gc`／`gr`）或統一兩套部門色。
12. ❌ 不要一次大範圍重構；使用者要的是「能用、看得懂、自己改得動」的程式碼。

### 7.3 遇到這些情況，先問使用者
- 新頁面的版面設計（請使用者提供 Figma 截圖）
- 要用哪一套部門色
- 新增服務在 Bento 的位置
- 要不要放進導覽列、放在哪個分類
- 英文翻譯的專有名詞（部門、活動名稱）是否有既定譯名
- 任何會影響網址、SEO、或刪除既有內容的變更

---

## 8. 無障礙與品質細節

- 圖片要有 `alt`（文字走 i18n）；純裝飾圖用 `alt=""` 加 `aria-hidden`。
- 圖示按鈕要有 `aria-label`（如漢堡選單）。
- `<html lang>` 由 i18n 自動切換（`zh-Hant-TW`／`en`），不用手動設。
- 瀏覽器儲存（`localStorage`）一律包 `try/catch`（無痕模式不能讓網站壞掉），比照 `i18n/index.tsx`。
- 公告圖片很小會被打包成 `data:` 網址，不能當分享預覽圖（`seo.ts` 已處理）。

---

## 9. 已知待處理事項（接手時可順手提醒使用者，但不要自己改）

- 預設分享預覽圖仍是 `apple-touch-icon.png`，建議做一張 1200×630 的 `og-image.png`。
- `servicesData.ts` 的 `textbook`（教科書代訂）尚未填 `href`。
- 小圖盃服務的 `href` 是 `"/#/calendar?event=2"`，依賴陣列順序，之後若調整 `events.ts` 可能會指錯活動。
- 專案文件區有部分舊檔重複（例：`latest/` 與 `ui/latest/` 各有一份 `Calendar.tsx`、`events.ts`），**以 `src/ui/...` 底下的版本為準**。

---

## 10. 快速檢查清單（每次交件前自我檢查）

- [ ] 用繁體中文回覆，並列出修改的檔案路徑
- [ ] 中英文都有
- [ ] 電腦版沒被動到；手機、平板也看過
- [ ] 沿用既有字體、顏色、元件、命名
- [ ] 新分頁有改 routing.ts、App.tsx、seo.ts、locales
- [ ] slug 唯一、沒有改到舊 slug
- [ ] 日期格式正確（公告 `YYYY.MM.DD`、活動 `YYYY-MM-DD`）
- [ ] 沒有捏造資料；不確定的地方已標 `TODO` 並告知
- [ ] `npm run typecheck` 會通過
