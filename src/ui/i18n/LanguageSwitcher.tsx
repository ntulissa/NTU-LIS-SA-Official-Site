import { useI18n, type Lang } from "./index";

// 語言切換按鈕：「中 | EN」兩段式膠囊，目前語言會反白。
// size="md"：電腦版導覽列用；size="sm"：手機版 Header 右上角用。
export default function LanguageSwitcher({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const { lang, setLang, t } = useI18n();

  const options: { value: Lang; label: string; full: string }[] = [
    { value: "zh-TW", label: t.lang.zh, full: "繁體中文" },
    { value: "en", label: t.lang.en, full: "English" },
  ];

  const pad = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const fontSize = size === "sm" ? "0.72rem" : "0.78rem";

  return (
    <div
      role="group"
      aria-label={t.lang.switchLabel}
      className={`inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] p-0.5 shrink-0 ${className}`}
    >
      {options.map((o) => {
        const active = o.value === lang;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setLang(o.value)}
            aria-pressed={active}
            aria-label={o.full}
            title={o.full}
            lang={o.value === "en" ? "en" : "zh-Hant-TW"}
            className={`${pad} rounded-full transition-colors duration-200 ${
              active ? "bg-white text-black" : "text-white/60 hover:text-white"
            }`}
            style={{
              fontFamily: "'Ubuntu Sans Mono', 'Noto Sans TC', monospace",
              fontWeight: 700,
              fontSize,
              letterSpacing: "0.06em",
              lineHeight: 1.2,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}