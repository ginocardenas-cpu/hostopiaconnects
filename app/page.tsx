import Link from "next/link";
import { Compass, FileStack, Target } from "lucide-react";
import { journeys } from "@/lib/assets";
import { HomeHighlights } from "@/components/HomeHighlights";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col justify-center items-center px-6 py-16">
        <div className="max-w-4xl text-center">
          <p
            className="uppercase mb-1"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#2CADB2"
            }}
          >
            Welcome
          </p>
          <p
            className="uppercase mb-4"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#2CADB2"
            }}
          >
            to
          </p>
          <h1
            className="font-black leading-tight mb-10"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              color: "#2CADB2"
            }}
          >
            HostopiaConnects.
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto mb-10"
            style={{
              fontFamily: "Raleway, sans-serif",
              color: "#555A5E",
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
              className="w-full rounded-full border border-black/10 bg-white/90 px-5 py-3 text-sm outline-none shadow-sm focus:border-[#2CADB2] focus:ring-1 focus:ring-[#2CADB2]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a
              href="#products"
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
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold border-2 border-[#24282B]/20 transition hover:bg-white hover:border-[#2CADB2]"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
            >
              How Hostopia Connects Works
            </Link>
          </div>
        </div>
      </section>
      <HomeHighlights />

      {/* Browse by product journey */}
      <section
        id="products"
        className="py-16 border-t border-black/5 bg-gradient-to-b from-white via-[#f7f6f2] to-[#f0fbfa]"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px" style={{ backgroundColor: "#F8CF41" }} />
                <span
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]"
                  style={{ fontFamily: "Raleway, sans-serif", color: "#2CADB2" }}
                >
                  <Compass size={14} />
                  Browse by Product Journey
                </span>
              </div>
              <h2
                className="font-black leading-tight"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  color: "#24282B"
                }}
              >
                Start where your customer is.
              </h2>
            </div>
            <p
              className="text-lg max-w-2xl mb-10"
              style={{
                fontFamily: "Raleway, sans-serif",
                color: "#555A5E",
                lineHeight: 1.625
              }}
            >
              Organized around the same journeys as your Hostopia product
              navigation – so sales decks, playbooks, and training always match
              how you go to market.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {journeys.map((journey) => (
              <Link
                key={journey.label}
                href={`/assets/journey/${journey.slug}`}
                className="group relative overflow-hidden text-left rounded-2xl border border-black/5 bg-[#f7f6f2] p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              >
                <div className="absolute -top-6 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#2CADB2]/10 via-[#F8CF41]/20 to-transparent" />
                <div
                  className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase mb-3 text-gray-500"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  <span className="text-xs">◎</span>
                  <span>Journey</span>
                </div>
                <div
                  className="font-black mb-2"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "1.2rem"
                  }}
                >
                  {journey.label}
                </div>
                <p
                  className="text-lg"
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    color: "#555A5E",
                    lineHeight: 1.625
                  }}
                >
                  Tap to see assets aligned to this step of the customer journey.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by type / use case */}
      <section
        id="browse-type"
        className="py-16 border-t border-black/5 bg-[#f7f6f2]"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h3
                className="font-black mb-4 inline-flex items-center gap-2"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "clamp(1.35rem, 2.5vw, 1.75rem)",
                  color: "#24282B"
                }}
              >
                <FileStack size={22} className="text-[#2CADB2]" />
                Browse by content type.
              </h3>
              <p
                className="text-lg max-w-2xl mb-10"
                style={{
                  fontFamily: "Raleway, sans-serif",
                  color: "#555A5E",
                  lineHeight: 1.625
                }}
              >
                Quickly jump to the exact kind of asset you need – decks,
                documents, videos, or full campaign kits.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {["Videos", "Decks & Presentations", "Documents & Playbooks", "Training Modules"].map(
                  (type) => (
                    <button
                      key={type}
                      className="rounded-xl border border-black/5 bg-white px-4 py-3 text-left hover:border-[#2CADB2] hover:shadow-md transition-all duration-150"
                    >
                      <span
                        className="block text-sm font-semibold mb-1"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {type}
                      </span>
                      <span
                        className="block text-lg"
                        style={{
                          fontFamily: "Raleway, sans-serif",
                          color: "#555A5E",
                          lineHeight: 1.625
                        }}
                      >
                        Coming soon – filterable libraries for each content
                        type.
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div id="browse-use-case">
              <h3
                className="font-black mb-4 inline-flex items-center gap-2"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "clamp(1.35rem, 2.5vw, 1.75rem)",
                  color: "#24282B"
                }}
              >
                <Target size={22} className="text-[#2CADB2]" />
                Browse by use case.
              </h3>
              <p
                className="text-lg max-w-2xl mb-10"
                style={{
                  fontFamily: "Raleway, sans-serif",
                  color: "#555A5E",
                  lineHeight: 1.625
                }}
              >
                Or start from what you&apos;re trying to do – train new reps,
                launch a campaign, or support existing customers.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {["Sales", "Marketing", "Training & Onboarding", "Support"].map(
                  (useCase) => (
                    <button
                      key={useCase}
                      className="rounded-xl border border-black/5 bg-white px-4 py-3 text-left hover:border-[#2CADB2] hover:shadow-md transition-all duration-150"
                    >
                      <span
                        className="block text-sm font-semibold mb-1"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {useCase}
                      </span>
                      <span
                        className="block text-lg"
                        style={{
                          fontFamily: "Raleway, sans-serif",
                          color: "#555A5E",
                          lineHeight: 1.625
                        }}
                      >
                        Coming soon – curated asset collections for this
                        workflow.
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

