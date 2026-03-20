"use client";

import { useState, useEffect, useRef, useId } from "react";
import { allAssetLanguages, type AssetLanguage } from "@/lib/assets";
import { ASSET_LANGUAGE_FLAGS } from "@/lib/assetLanguageFlags";

const ALL_LANG_FLAG = "🌐";

type TLibrary = (key: string) => string;

export function LibraryLanguageFilter({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (lang: string) => void;
  t: TLibrary;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = value as AssetLanguage | "";

  return (
    <div className="relative" ref={ref}>
      <label
        id={labelId}
        className="block text-xs font-heading font-bold uppercase text-gray-500 mb-2"
      >
        {t("language")}
      </label>
      <button
        type="button"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-body bg-white outline-none focus:border-[#2CADB2] flex items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-lg emoji-flag leading-none shrink-0" aria-hidden>
            {selected ? ASSET_LANGUAGE_FLAGS[selected] : ALL_LANG_FLAG}
          </span>
          <span className="truncate">{value || t("allLanguages")}</span>
        </span>
        <i
          className={`fa-solid fa-chevron-${open ? "up" : "down"} text-[10px] text-gray-400 shrink-0`}
          aria-hidden
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[#2CADB2]/10 ${
                !value ? "bg-[#2CADB2]/10 font-semibold text-[#2CADB2]" : ""
              }`}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <span className="text-lg emoji-flag leading-none" aria-hidden>
                {ALL_LANG_FLAG}
              </span>
              {t("allLanguages")}
            </button>
          </li>
          {allAssetLanguages.map((lang) => (
            <li key={lang} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === lang}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[#2CADB2]/10 ${
                  value === lang
                    ? "bg-[#2CADB2]/10 font-semibold text-[#2CADB2]"
                    : ""
                }`}
                onClick={() => {
                  onChange(lang);
                  setOpen(false);
                }}
              >
                <span className="text-lg emoji-flag leading-none" aria-hidden>
                  {ASSET_LANGUAGE_FLAGS[lang]}
                </span>
                {lang}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
