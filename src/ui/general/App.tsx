import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollIndicator from "./ScrollIndicator";
import Hero from "../home-page/Hero";
import AnnouncementSearch from "../home-page/AnnouncementSearch";
import Upcoming from "../home-page/Upcoming";
import Lounge from "../home-page/Lounge";
import SportsTeam from "../home-page/SportsTeam";
import Dashboard from "../about-us/Dashboard";
import AboutUs from "../about-us/AboutUs";
import Team from "../about-us/Team";
import News from "../latest/News.tsx";
import Article from "../latest/Article";
import Sources from "../services/Sources";
import Recruit from "../join-us/Recruit";
import Survey from "../join-us/Survey";
import Contact from "../services/Contact";
import Presidents from "../about-us/Presidents.tsx";
import Calendar from "../latest/Calendar";
import Fee from "../support-us/Fee";
import Sponsor from "../support-us/Sponsor";
import Department from "../about-us/Department";
import Services from "../services/Services";
import { LanguageProvider, useI18n } from "../i18n";
import {
  NAVIGATE_EVENT,
  currentRoute,
  currentUrlLang,
  navigate,
  resolveSpaHref,
  splitLang,
  upgradeLegacyUrl,
  withLang,
  type Route,
} from "./routing";
import { applyHeadToDocument, buildHead } from "../../seo/seo";

// 分頁網址（/news、/en/news …）的規則都在 ./routing.ts。
// ★ 各頁元件裡舊的 href="#/xxx"、window.location.hash = "#/xxx" 不用改，下面會自動轉成新網址。
// ★ 每一頁的分頁標題、Google 描述、canonical 在 ../../seo/seo.ts。

// 最外層：包上 LanguageProvider，裡面所有元件才能用 useI18n() 拿到目前語言。
export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const { lang } = useI18n();
  const [route, setRoute] = useState<Route>(currentRoute);

  // ── 換頁：監聽「站內換頁」「瀏覽器上一頁／下一頁」「網址 # 改變」──
  useEffect(() => {
    const sync = () => {
      // 舊寫法相容：有元件執行 window.location.hash = "#/news" → 轉成 /news
      upgradeLegacyUrl();

      // 在其他頁點了主頁的錨點（例如 /news 頁點 #team）→ 回主頁再捲到該區塊
      const { hash } = window.location;
      const anchor = hash.length > 1 && !hash.startsWith("#/") ? hash.slice(1) : "";
      const { path } = splitLang(window.location.pathname);
      if (anchor && path !== "/") {
        window.history.replaceState(window.history.state, "", `${withLang("/", currentUrlLang())}${hash}`);
      }

      const r = currentRoute();
      setRoute(r);
      if (r.name !== "home" || !anchor) {
        window.scrollTo({ top: 0 });
        return;
      }
      // 等主頁重繪後再捲到錨點
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
        })
      );
    };
    window.addEventListener(NAVIGATE_EVENT, sync);
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener(NAVIGATE_EVENT, sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  // ── 點連結：站內分頁連結不重新整理，直接換頁 ──
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a");
      if (!link || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;
      const href = link.getAttribute("href");
      if (!href) return;

      // 主頁錨點（#team 等）：在主頁時交給瀏覽器捲動；在其他頁時先回主頁
      if (href.startsWith("#") && !href.startsWith("#/") && href !== "#") {
        if (splitLang(window.location.pathname).path !== "/") {
          e.preventDefault();
          navigate(`/${href}`);
        }
        return;
      }

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // 檔案（PDF、圖片…）照常開啟，不當成分頁
      if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return;
      e.preventDefault();
      const { path } = splitLang(url.pathname);
      const sameUrl = url.pathname === window.location.pathname && url.search === window.location.search && !url.hash;
      if (sameUrl) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      navigate(`${path}${url.search}${url.hash}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // ── 每一頁的分頁標題、Google 描述、canonical、分享預覽 ──
  useEffect(() => {
    applyHeadToDocument(buildHead(route, lang));
  }, [route, lang]);

  // ── 整理全站連結 ──
  //   1. 舊的 href="#/news" → 真正的網址 "/news"（英文版 "/en/news"），Google 才找得到每一頁
  //   2. 外部網址、mailto:、tel: → 另開分頁
  useEffect(() => {
    const fixLinks = () => {
      document.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        const raw = link.getAttribute("href");
        if (!raw) return;

        // 記住元件原本寫的連結（例如 "#/news"），切換語言時才能重新算出正確網址
        const original = link.dataset.spaWritten === raw ? link.dataset.spaHref ?? raw : raw;
        const resolved = resolveSpaHref(original, lang);
        if (resolved) {
          link.dataset.spaHref = original;
          link.dataset.spaWritten = resolved;
          if (raw !== resolved) link.setAttribute("href", resolved);
        } else if (link.dataset.spaHref) {
          delete link.dataset.spaHref;
          delete link.dataset.spaWritten;
        }

        const href = link.getAttribute("href") ?? "";
        const url = new URL(href, window.location.href);
        const isExternal = ["mailto:", "tel:"].includes(url.protocol)
          || ((url.protocol === "http:" || url.protocol === "https:")
            && url.origin !== window.location.origin);
        const openInNewWindow = isExternal || link.dataset.openNewTab === "true";

        if (openInNewWindow) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        } else {
          link.removeAttribute("target");
          link.removeAttribute("rel");
        }
      });
    };

    fixLinks();
    const observer = new MutationObserver(fixLinks);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });

    return () => observer.disconnect();
  }, [route, lang]);

  return (
    <div className="bg-black text-white overflow-x-hidden">
      <Header />

      {route.name === "current-team" ? (
        // 獨立頁：只顯示 Team（Header/Footer 在最外層一定會出現）。
        // 頂部間距由 Team 的 standalone 模式自己處理（剛好清掉固定 Header）。
        <Team standalone />
      ) : route.name === "about" ? (
        // 獨立頁：只顯示 AboutUs（Header/Footer 在最外層一定會出現）。
        <AboutUs />
      ) : route.name === "resources" ? (
        // 獨立頁：只顯示 Sources（Header/Footer 在最外層一定會出現）。
        <Sources />
      ) : route.name === "presidents" ? (
        <Presidents />
      ) : route.name === "join" ? (
        // 獨立頁：只顯示 Recruit（Header/Footer 在最外層一定會出現）。
        <Recruit />
      ) : route.name === "dept-quiz" ? (
        // 獨立頁：部門適性測驗。
        <Survey />
      ) : route.name === "contact" ? (
        // 獨立頁：只顯示 Contact（Header/Footer 在最外層一定會出現）。
        <Contact />
      ) : route.name === "overview" ? (
        // 獨立頁：只顯示 Dashboard（standalone＝填滿一屏、底部不被切）。
        <Dashboard standalone />
      ) : route.name === "news" ? (
        // 獨立頁：公告列表（standalone＝多留頂部空間清掉固定 Header）。
        <News standalone />
      ) : route.name === "article" ? (
        // 獨立頁：單篇公告文章。
        <Article slug={route.slug} />
      ) : route.name === "calendar" ? (
        // 獨立頁：系學會行事曆（Header/Footer 在最外層一定會出現）。
        <Calendar />
      ) : route.name === "fees" ? (
        // 系學會費專區（捲動式；Header 於最上方為透明疊在 Hero 上）。
        <Fee />
      ) : route.name === "sponsor" ? (
        // 贊助頁（捲動式）。
        <Sponsor />
      ) : route.name === "dept" ? (
        <Department slug={route.slug} />
      ) : route.name === "services" ? (
        // 各種服務 Bento 總覽頁。
        <Services />
      ) : route.name === "service" ? (
        // 單一服務詳情頁。
        <Services slug={route.slug} />
      ) : (
        <>
          <Hero />
          {/* 公告搜尋區：緊接在 Hero 後面，讓大家一進首頁就找得到公告 */}
          <AnnouncementSearch />
          <AboutUs />
          <Upcoming />
          <Lounge />
          <SportsTeam />
          <Dashboard />
        </>
      )}

      <Footer />
      <ScrollIndicator />
    </div>
  );
}