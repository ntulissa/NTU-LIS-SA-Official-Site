import { createRoot } from "react-dom/client";
import App from "./ui/general/App";
import { upgradeLegacyUrl } from "./ui/general/routing";
import "./styles/index.css";

// 舊網址自動轉新網址（在畫面出現之前就轉好）：
//   https://www.ntulissa.com/#/news      → https://www.ntulissa.com/news
//   https://www.ntulissa.com/?lang=en    → https://www.ntulissa.com/en
upgradeLegacyUrl();

createRoot(document.getElementById("root")!).render(<App />);
