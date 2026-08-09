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

// 極輕量的 hash 分頁：#/presidents 顯示「歷任會長」頁，其餘顯示捲動式主頁。
// （不需安裝 react-router；同時保留原本 #team / #news 等錨點捲動。）
function getRoute() {
  return window.location.hash.startsWith("#/presidents") ? "presidents" : "home";
}

export default function App() {
  const [route, setRoute] = useState<"home" | "presidents">(getRoute());

  useEffect(() => {
    const onHash = () => {
      const r = getRoute();
      setRoute(r);
      if (r === "presidents") {
        window.scrollTo({ top: 0 });
        return;
      }
      // 從歷任會長頁點主頁錨點（#team 等）時，等主頁重繪後再捲動。
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

      {route === "presidents" ? (
        <PastPresidentsSection />
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