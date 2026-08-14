import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollIndicator from "./components/ScrollIndicator";
import HeroSection from "./components/sections/HeroSection";
import BentoSection from "./components/sections/BentoSection";
import SloganSection from "./components/sections/SloganSection";
import HistorySection from "./components/sections/HistorySection";
import TeamSection from "./components/sections/TeamSection";
import SloganPage2Section from "./components/sections/SloganPage2Section";
import LatestUpdatesSection from "./components/sections/LatestUpdatesSection";
import AcademicResourcesSection from "./components/sections/AcademicResourcesSection";
import JoinUsSection from "./components/sections/JoinUsSection";
import PastPresidentsSection from "./components/sections/PastPresidentsSection";
import DepartmentPage from "./components/department-pages/DepartmentPage";

// 極輕量的 hash 分頁（不需安裝 react-router；同時保留原本 #team / #news 等錨點捲動）：
//   #/presidents      → 歷任會長頁
//   #/dept/<slug>     → 部門獨立頁（例：#/dept/gen ＝行政部；slug 同 department-pages/ 檔名）
//   其餘              → 捲動式主頁
type Route = { name: "home" } | { name: "presidents" } | { name: "dept"; slug: string };

function getRoute(): Route {
  const h = window.location.hash;
  if (h.startsWith("#/presidents")) return { name: "presidents" };
  const m = h.match(/^#\/dept\/([\w-]+)/);
  if (m) return { name: "dept", slug: m[1] };
  return { name: "home" };
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const onHash = () => {
      const r = getRoute();
      setRoute(r);
      if (r.name !== "home") {
        window.scrollTo({ top: 0 });
        return;
      }
      // 從獨立頁點主頁錨點（#team 等）時，等主頁重繪後再捲動。
      const id = window.location.hash.slice(1);
      if (id && !id.startsWith("/")) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          })
        );
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="bg-black text-white overflow-x-hidden">
      <Header />

      {route.name === "presidents" ? (
        <PastPresidentsSection />
      ) : route.name === "dept" ? (
        <DepartmentPage slug={route.slug} />
      ) : (
        <>
          <HeroSection />
          <BentoSection />
          <SloganSection />
          <HistorySection />
          <TeamSection />
          <SloganPage2Section />
          <LatestUpdatesSection />
          <AcademicResourcesSection />
          <JoinUsSection />
        </>
      )}

      <Footer />
      {/* 固定於畫面下方的捲動提示；滑到 Footer 會自動淡出 */}
      <ScrollIndicator />
    </div>
  );
}