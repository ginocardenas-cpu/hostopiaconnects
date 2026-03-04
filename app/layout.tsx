import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { CartLayoutClient } from "@/components/CartLayoutClient";
import { CartNav } from "@/components/CartNav";

export const metadata = {
  title: "Hostopia Connects",
  description: "Sales and marketing enablement hub for Hostopia partners and teams."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartLayoutClient>
          <div className="min-h-screen bg-[#f7f6f2] text-[#24282B] flex flex-col">
            {/* Top navigation */}
            <header className="border-b border-black/5 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#2CADB2] via-[#F8CF41] to-[#2CADB2]" />
              <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
                <Link href="/" className="flex items-center gap-3">
                  <div className="relative h-9 w-[140px] shrink-0">
                    <Image
                      src="/logo.png"
                      alt="Hostopia Connects"
                      width={140}
                      height={36}
                      className="object-contain object-left"
                      priority
                      unoptimized
                    />
                  </div>
                  <div className="hidden sm:flex flex-col leading-tight">
                    <span
                      className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-500"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Connects Portal
                    </span>
                    <span
                      className="text-xs text-gray-600"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Sales &amp; marketing enablement
                    </span>
                  </div>
                </Link>

                <CartNav />
              </div>
            </header>

            <main className="flex-1">
              {children}
            </main>

            <footer className="border-t border-black/5 py-6 text-center text-xs text-gray-500">
              <span style={{ fontFamily: "Raleway, sans-serif" }}>
                © {new Date().getFullYear()} Hostopia. Hostopia Connects – internal enablement prototype.
              </span>
            </footer>
          </div>
        </CartLayoutClient>
      </body>
    </html>
  );
}

