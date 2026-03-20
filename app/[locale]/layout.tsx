import type { ReactNode } from "react";
import Image from "next/image";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { CartLayoutClient } from "@/components/CartLayoutClient";
import { CartNav } from "@/components/CartNav";
import { TickerBar } from "@/components/TickerBar";
import { SearchBar } from "@/components/SearchBar";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const tNav = await getTranslations("nav");
  const tFooter = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <CartLayoutClient>
        <div className="min-h-screen bg-[#f7f6f2] text-[#24282B] flex flex-col">
          <TickerBar />

          {/* Header – dark nav */}
          <header className="bg-[#2A2930] sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
              {/* Logo */}
              <Link href="/" className="flex-shrink-0" aria-label="Hostopia Connects home">
                <Image
                  src="/logo-hostopia-nav.png"
                  alt="Hostopia - A HostPapa Company"
                  width={160}
                  height={48}
                  className="h-10 w-auto object-contain brightness-0 invert"
                  priority
                />
              </Link>

              {/* Nav */}
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/"
                  className="text-xs font-heading font-semibold uppercase tracking-wider text-white/80 hover:text-[#2CADB2] transition-colors"
                >
                  {tNav("home")}
                </Link>
                <Link
                  href="/library"
                  className="text-xs font-heading font-semibold uppercase tracking-wider text-white/80 hover:text-[#2CADB2] transition-colors"
                >
                  Library
                </Link>
                <Link
                  href="/featured"
                  className="text-xs font-heading font-semibold uppercase tracking-wider text-white/80 hover:text-[#2CADB2] transition-colors"
                >
                  Featured
                </Link>
              </nav>

              {/* Right: search, briefcase, language */}
              <div className="flex items-center gap-3">
                <SearchBar />
                <CartNav />
                <LanguageSwitcher />
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          {/* Footer – minimal: logo, tagline, social */}
          <footer className="bg-[#1a1d20] border-t-2 border-[#2CADB2]/30">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex flex-col items-center text-center gap-4">
                <Link href="/" className="inline-block">
                  <Image
                    src="/logo-hostopia-nav.png"
                    alt="Hostopia"
                    width={140}
                    height={42}
                    className="h-8 w-auto object-contain brightness-0 invert"
                  />
                </Link>
                <p className="text-[13px] text-gray-400 font-body leading-relaxed max-w-sm">
                  Behind the brands that power small business.
                </p>
                <div className="flex items-center gap-5 mt-1">
                  <a href="https://www.linkedin.com/company/hostopia" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#2CADB2] transition-colors" aria-label="LinkedIn">
                    <i className="fa-brands fa-linkedin-in text-base" />
                  </a>
                  <a href="https://www.facebook.com/Hostopia-104896838563842" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#2CADB2] transition-colors" aria-label="Facebook">
                    <i className="fa-brands fa-facebook-f text-base" />
                  </a>
                  <a href="https://twitter.com/Hostopia_Global" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#2CADB2] transition-colors" aria-label="X / Twitter">
                    <i className="fa-brands fa-x-twitter text-base" />
                  </a>
                </div>
                <div className="border-t border-white/10 w-full mt-4 pt-4">
                  <p className="text-xs text-gray-600 font-body" suppressHydrationWarning>
                    {tFooter("copyright", { year })}
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </CartLayoutClient>
    </NextIntlClientProvider>
  );
}
