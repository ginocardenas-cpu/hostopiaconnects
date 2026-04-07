import type { ReactNode } from "react";
import Image from "next/image";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { CartLayoutClient } from "@/components/CartLayoutClient";
import { CartNav } from "@/components/CartNav";
import { TickerBar } from "@/components/TickerBar";
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
  const tFooter = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <CartLayoutClient>
        <div className="min-h-screen bg-cream text-charcoal flex flex-col">
          <TickerBar />
          <header className="border-b border-black/5 bg-white sticky top-0 z-20">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-teal via-gold to-teal" />
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
              <Link href="/" className="flex-shrink-0" aria-label="Hostopia Connects home">
                <Image
                  src="/logo-hostopia-nav.png"
                  alt="Hostopia - A HostPapa Company"
                  width={160}
                  height={48}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </Link>
              <div className="flex items-center gap-4">
                <CartNav />
                <LanguageSwitcher />
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t border-black/5 py-6 text-center font-body text-xs text-gray-500" suppressHydrationWarning>
            {tFooter("copyright", { year })}
          </footer>
        </div>
      </CartLayoutClient>
    </NextIntlClientProvider>
  );
}
