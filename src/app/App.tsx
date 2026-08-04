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

export default function App() {
  return (
    <div className="bg-black text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <BentoSection />
      <SloganSection />
      <HistorySection />
      <TeamSection />
      <SloganPage2Section />
      <LatestUpdatesSection />
      <AcademicResourcesSection />
      <JoinUsSection />
      <Footer />
      {/* 固定於畫面下方的捲動提示；滑到 Footer 會自動淡出 */}
      <ScrollIndicator />
    </div>
  );
}