import type { ReactNode } from "react";
import Image from "next/image";
import { getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { CartLayoutClient } from "@/components/CartLayoutClient";
import { TickerBar } from "@/components/TickerBar";
import { Link } from "@/i18n/routing";
import { LocaleHeader } from "@/components/LocaleHeader";

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
        <div className="min-h-screen bg-white text-[#24282B] flex flex-col">
          <TickerBar />

          <LocaleHeader />

          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex flex-col items-center text-center gap-4">
                <Link href="/" className="inline-block">
                  <Image
                    src="/logo-hostopia-nav.png"
                    alt="Hostopia"
                    width={140}
                    height={42}
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <p className="text-[13px] text-gray-500 font-body leading-relaxed max-w-sm">
                  {tFooter("tagline")}
                </p>
                <div className="flex items-center gap-5 mt-1">
                  <a href="https://www.linkedin.com/company/hostopia" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#2CADB2] transition-colors" aria-label="LinkedIn">
                    <i className="fa-brands fa-linkedin-in text-base" />
                  </a>
                  <a href="https://www.facebook.com/Hostopia-104896838563842" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#2CADB2] transition-colors" aria-label="Facebook">
                    <i className="fa-brands fa-facebook-f text-base" />
                  </a>
                  <a href="https://twitter.com/Hostopia_Global" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#2CADB2] transition-colors" aria-label="X / Twitter">
                    <i className="fa-brands fa-x-twitter text-base" />
                  </a>
                </div>
                <div className="border-t border-gray-100 w-full mt-4 pt-4">
                  <p className="text-xs text-gray-400 font-body" suppressHydrationWarning>
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
