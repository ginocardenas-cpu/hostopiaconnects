"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { CartNav } from "@/components/CartNav";
import { SearchBar } from "@/components/SearchBar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const linkClassName =
  "block py-3 text-sm font-heading font-semibold uppercase tracking-wider text-[#24282B]/80 hover:text-[#2CADB2] transition-colors border-b border-gray-100 last:border-0";

const desktopLinkClassName =
  "text-xs font-heading font-semibold uppercase tracking-wider text-[#24282B]/70 hover:text-[#2CADB2] transition-colors";

export function LocaleHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/library", label: t("library") },
    { href: "/how-it-works", label: t("howItWorks") },
  ] as const;

  return (
    <>
      {mobileOpen ? (
        <div
          className="md:hidden fixed inset-0 z-[18] cursor-pointer bg-black/25"
          aria-hidden
          onClick={() => setMobileOpen(false)}
          role="presentation"
        />
      ) : null}

      <header
        className={`bg-white border-b border-gray-200 sticky top-0 ${
          mobileOpen ? "z-[30]" : "z-20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex-shrink-0 min-w-0" aria-label="Hostopia Connects home">
            <Image
              src="/logo-hostopia-nav.png"
              alt="Hostopia - A HostPapa Company"
              width={160}
              height={48}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-8 flex-1 justify-center"
            aria-label={t("mainNavigation")}
          >
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className={desktopLinkClassName}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 hover:text-[#2CADB2] transition-colors"
              aria-expanded={mobileOpen}
              aria-controls="mobile-primary-nav"
              aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={22} strokeWidth={2.25} /> : <Menu size={22} strokeWidth={2.25} />}
            </button>

            <SearchBar />
            <CartNav />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile nav panel */}
        {mobileOpen ? (
          <nav
            id="mobile-primary-nav"
            className="md:hidden border-t border-gray-100 bg-white px-4 sm:px-6 py-2 shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
            aria-label={t("mainNavigation")}
          >
            {navItems.map(({ href, label }) => (
              <Link key={href} href={href} className={linkClassName} onClick={() => setMobileOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
    </>
  );
}
