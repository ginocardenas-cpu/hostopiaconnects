import Link from "next/link";
import { HomeHighlights } from "@/components/HomeHighlights";
import { UniqueAccordion } from "@/components/ui/interactive-accordion";

export default function Home() {
  return (
    <>
      {/* Hero with background image */}
      <section
        className="relative min-h-[70vh] flex flex-col justify-center items-center px-6 py-16 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-hands.png')" }}
      >
        <div className="absolute inset-0 bg-[#24282B]/70" aria-hidden />
        <div className="relative z-10 max-w-4xl text-center">
          <p
            className="uppercase mb-1 text-white"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em"
            }}
          >
            Welcome
          </p>
          <p
            className="uppercase mb-4 text-white"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em"
            }}
          >
            to
          </p>
          <h1
            className="font-black leading-tight mb-10"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)"
            }}
          >
            <span style={{ color: "#2CADB2" }}>Hostopia</span>
            <span className="text-white">Connects</span>
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-10 text-white"
            style={{
              fontFamily: "Raleway, sans-serif",
              lineHeight: 1.625
            }}
          >
            A portal for Hostopia product, sales, and training content –
            all in one place.
          </p>
          <div className="max-w-2xl mx-auto mb-10">
            <input
              type="search"
              placeholder="Search for a product, asset, or use case"
              className="w-full rounded-full border border-white/30 bg-white/95 px-5 py-3 text-sm outline-none shadow-sm focus:border-[#2CADB2] focus:ring-1 focus:ring-[#2CADB2] text-[#24282B]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a
              href="#browse-options"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-bold shadow-md transition hover:shadow-lg"
              style={{
                fontFamily: "Montserrat, sans-serif",
                backgroundColor: "#F8CF41",
                color: "#24282B"
              }}
            >
              Start Browsing by Product
            </a>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold border-2 border-white/60 text-white transition hover:bg-white/10 hover:border-white"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              How Hostopia Connects Works
            </Link>
          </div>
        </div>
      </section>
      <HomeHighlights />

      {/* Browse options – title, sub copy, then accordion with content blocks below */}
      <section id="browse-options" className="py-10 border-t border-black/5 bg-[#f7f6f2] scroll-mt-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-3 mb-10">
            <p
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]"
              style={{ fontFamily: "Raleway, sans-serif", color: "#2CADB2" }}
            >
              Browse options
            </p>
            <h2
              className="font-black leading-tight"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                color: "#24282B"
              }}
            >
              Choose how you want to find assets.
            </h2>
            <p
              className="text-base max-w-2xl"
              style={{
                fontFamily: "Raleway, sans-serif",
                color: "#555A5E",
                lineHeight: 1.625
              }}
            >
              Start from a customer journey, a content format, or a workflow. Use the options below to explore
              the approach that matches how you work today.
            </p>
          </div>
          <UniqueAccordion />
        </div>
      </section>

    </>
  );
}

