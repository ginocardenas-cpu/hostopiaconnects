import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Hostopia Connects",
  description: "Sales and marketing enablement hub for Hostopia partners and teams."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#f7f6f2] text-[#24282B] flex flex-col">
          {/* Top navigation */}
          <header className="border-b border-black/5 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2CADB2] flex items-center justify-center text-xs font-black text-white">
                  HC
                </div>
                <div className="flex flex-col leading-tight">
                  <span
                    className="text-sm font-black tracking-wide uppercase"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Hostopia Connects
                  </span>
                  <span
                    className="text-[11px] text-gray-500"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Sales &amp; marketing enablement portal
                  </span>
                </div>
              </Link>

              <nav
                className="hidden md:flex items-center gap-6 text-sm"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <Link href="/" className="hover:text-[#2CADB2] transition-colors">
                  Home
                </Link>
                <a href="#products" className="hover:text-[#2CADB2] transition-colors">
                  Products
                </a>
                <a href="#browse-type" className="hover:text-[#2CADB2] transition-colors">
                  Browse by Type
                </a>
                <a href="#browse-use-case" className="hover:text-[#2CADB2] transition-colors">
                  Browse by Use Case
                </a>
                <a href="#download-cart" className="hover:text-[#2CADB2] transition-colors">
                  Download Cart
                </a>
              </nav>
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
      </body>
    </html>
  );
}

