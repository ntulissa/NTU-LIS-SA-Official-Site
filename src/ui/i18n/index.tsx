// ══════════════════════════════════════════════════════════════════════════
// 中英切換（i18n）核心
// ──────────────────────────────────────────────────────────────────────────
// 在任何元件裡這樣用：
//
//   import { useI18n } from "../i18n";
//
//   const { t, lang, setLang, pick } = useI18n();
//
//   t.nav.about                         → 「關於我們」或「About」（全站共用的介面文字，放在 locales/ 裡）
//   pick({ zh: "迎新", en: "Orientation" }) → 依目前語言選一個
//   pick(TEXT)                          → 某一頁自己的文字（TEXT 用 defineText 寫在該頁檔案最上方）
//   localize(活動或公告資料)              → 英文版時，把 titleEn 換成 title、descEn 換成 desc…（沒填英文就沿用中文）
//   track("0.3em")                      → 字距：中文用 0.3em，英文自動縮成 0.02em（英文字距拉太開很難讀）
//   lang                                → "zh-TW" 或 "en"
//   setLang("en")                       → 切換語言
//
// ★ 資料檔（news.ts、events.ts、servicesData.ts…）的英文寫法：
//   在中文欄位旁邊加一個「同名 + En」的欄位即可，例如：
//     title: "新生迎新活動",
//     titleEn: "Freshman Orientation",
//   沒填 titleEn 的話，英文版會先顯示中文，網站不會壞掉。
//
// 語言決定順序：網址 ?lang=en → 上次選過的（存在瀏覽器）→ 瀏覽器語言 → 預設繁中。
// 語言放在網址的「?lang=en」，所以 #/news 這類換頁連結完全不用改，分享連結也會保留語言。
// ══════════════════════════════════════════════════════════════════════════

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import zhTW, { type Messages } from "./locales/zh-TW";
import en from "./locales/en";

export type Lang = "zh-TW" | "en";

export const LANGS: Lang[] = ["zh-TW", "en"];
const DEFAULT_LANG: Lang = "zh-TW";
const STORAGE_KEY = "ntulissa-lang";
const URL_PARAM = "lang";

const MESSAGES: Record<Lang, Messages> = { "zh-TW": zhTW, en };

// <html lang="..."> 用的語言代碼（螢幕閱讀器、搜尋引擎、瀏覽器翻譯都看這個）
const HTML_LANG: Record<Lang, string> = { "zh-TW": "zh-Hant-TW", en: "en" };

/** 同一段資料的中英兩個版本，例如 { zh: "迎新宿營", en: "Freshman Camp" } */
export type Bilingual<T = string> = { zh: T; en: T };

/**
 * 某一頁自己的中英文字。英文那份的結構必須和中文一模一樣（少一個欄位，編輯器會標紅）。
 *
 *   const TEXT = defineText({
 *     zh: { title: "加入我們", button: "立即報名" },
 *     en: { title: "Join Us", button: "Apply now" },
 *   });
 *   // 元件裡：const tx = pick(TEXT);  tx.title
 */
export function defineText<T>(text: { zh: T; en: NoInfer<T> }): Bilingual<T> {
  return text;
}

/**
 * 英文版時，把資料裡「xxxEn」欄位的值換到「xxx」。沒填英文（或是空字串）就保留中文。
 *   localizeFor("en", { title: "迎新", titleEn: "Orientation" }) → { title: "Orientation", ... }
 */
export function localizeFor<T extends object>(lang: Lang, obj: T): T {
  if (lang !== "en") return obj;
  const out: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  for (const [key, value] of Object.entries(obj)) {
    if (key.length > 2 && key.endsWith("En") && value != null && value !== "") {
      out[key.slice(0, -2)] = value;
    }
  }
  return out as T;
}

function normalize(value: string | null | undefined): Lang | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.startsWith("en")) return "en";
  if (v.startsWith("zh")) return "zh-TW";
  return null;
}

function readStored(): Lang | null {
  try {
    return normalize(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null; // 無痕模式或封鎖儲存空間時，不要讓網站壞掉
  }
}

function writeStored(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* 忽略 */
  }
}

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const fromUrl = normalize(new URLSearchParams(window.location.search).get(URL_PARAM));
  if (fromUrl) return fromUrl;
  const stored = readStored();
  if (stored) return stored;
  // 瀏覽器語言：只要使用者的第一偏好是英文就用英文，其餘（含中文）一律繁中
  return normalize(window.navigator.language) === "en" ? "en" : DEFAULT_LANG;
}

// 把語言寫進網址（?lang=en），不重新整理頁面，也不影響 # 後面的分頁
function syncUrl(lang: Lang) {
  const url = new URL(window.location.href);
  if (lang === DEFAULT_LANG) url.searchParams.delete(URL_PARAM);
  else url.searchParams.set(URL_PARAM, lang);
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
}

function syncDocument(lang: Lang) {
  const m = MESSAGES[lang];
  document.documentElement.lang = HTML_LANG[lang];
  document.title = m.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", m.meta.description);
}

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Messages;
  pick: <T>(value: Bilingual<T>) => T;
  localize: <T extends object>(obj: T) => T;
  /** 字距：中文版回傳 zh；英文版回傳 en（預設 0.02em） */
  track: (zh: string, en?: string) => string;
  isEn: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeStored(next);
  }, []);

  useEffect(() => {
    syncUrl(lang);
    syncDocument(lang);
  }, [lang]);

  // 換頁（#/xxx）時，有些瀏覽器會把 ?lang 弄掉，這裡補回去
  useEffect(() => {
    const onHash = () => syncUrl(lang);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t: MESSAGES[lang],
      pick: (v) => (lang === "en" ? v.en : v.zh),
      localize: (obj) => localizeFor(lang, obj),
      track: (zh, en = "0.02em") => (lang === "en" ? en : zh),
      isEn: lang === "en",
    }),
    [lang, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n() 必須在 <LanguageProvider> 裡面使用");
  return ctx;
}