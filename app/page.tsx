import Link from "next/link";
import { journeys } from "@/lib/assets";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col justify-center items-center px-6 py-16">
        <div className="max-w-4xl text-center">
          <p className="uppercase tracking-[0.2em] text-xs mb-4 text-gray-500">
            Hostopia Connects
          </p>
          <h1
            className="font-black leading-tight mb-6"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              color: "#24282B"
            }}
          >
            Everything your teams need to{" "}
            <span style={{ color: "#2CADB2" }}>sell, train, and launch</span>{" "}
            Hostopia products.
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed mb-10"
            style={{ fontFamily: "Raleway, sans-serif", color: "#6b7280" }}
          >
            A modern, public-facing portal for sales and marketing enablement.
            Browse by product journey, content type, or use case, then request a
            tailored download bundle delivered straight to your inbox.
          </p>
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
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold border border-[#24282B]/20 transition hover:bg-white"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#24282B" }}
            >
              How Hostopia Connects Works
            </a>
          </div>
        </div>
      </section>

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
                  className="section-label text-xs uppercase tracking-[0.2em] text-gray-500"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Browse by Product Journey
                </span>
              </div>
              <h2
                className="font-black leading-tight"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
                }}
              >
                Start where your customer is.
              </h2>
            </div>
            <p
              className="text-sm md:text-base max-w-md"
              style={{ fontFamily: "Raleway, sans-serif", color: "#6b7280" }}
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
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "Raleway, sans-serif" }}
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
                className="font-black mb-4"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "1.5rem"
                }}
              >
                Browse by content type.
              </h3>
              <p
                className="text-sm md:text-base mb-6"
                style={{ fontFamily: "Raleway, sans-serif", color: "#6b7280" }}
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
                        className="block text-xs text-gray-600"
                        style={{ fontFamily: "Raleway, sans-serif" }}
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
                className="font-black mb-4"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "1.5rem"
                }}
              >
                Browse by use case.
              </h3>
              <p
                className="text-sm md:text-base mb-6"
                style={{ fontFamily: "Raleway, sans-serif", color: "#6b7280" }}
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
                        className="block text-xs text-gray-600"
                        style={{ fontFamily: "Raleway, sans-serif" }}
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

      {/* How it works + Download Cart placeholder */}
      <section
        id="how-it-works"
        className="py-16 border-t border-black/5 bg-white"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-[1.4fr_minmax(0,1fr)] items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px" style={{ backgroundColor: "#2CADB2" }} />
                <span
                  className="text-xs uppercase tracking-[0.2em] text-gray-500"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  How Hostopia Connects Works
                </span>
              </div>
              <h2
                className="font-black mb-4"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "clamp(1.75rem, 3vw, 2.4rem)"
                }}
              >
                Add assets to your cart, then get a single download bundle in
                your inbox.
              </h2>
              <p
                className="text-sm md:text-base mb-6"
                style={{ fontFamily: "Raleway, sans-serif", color: "#6b7280" }}
              >
                Hostopia Connects is public to browse. When you&apos;re ready
                to download, you&apos;ll add assets to a Download Cart and
                request them in one step. We&apos;ll capture just three fields –
                name, company, and email – then email you secure, time-limited
                links for everything in your bundle.
              </p>
              <ol
                className="space-y-3 text-sm"
                style={{ fontFamily: "Raleway, sans-serif", color: "#4b5563" }}
              >
                <li>
                  <span className="font-semibold">1. Browse</span> by product
                  journey, content type, or use case.
                </li>
                <li>
                  <span className="font-semibold">2. Add to cart</span> on any
                  asset detail page you want to download.
                </li>
                <li>
                  <span className="font-semibold">3. Request your bundle</span>{" "}
                  once, then grab all assets from the email you receive.
                </li>
              </ol>
            </div>

            <div
              id="download-cart"
              className="rounded-2xl border border-dashed border-[#2CADB2]/50 bg-[#f7fefc] p-6"
            >
              <h3
                className="font-black mb-2"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "1.2rem"
                }}
              >
                Download Cart (coming next)
              </h3>
              <p
                className="text-sm mb-4"
                style={{ fontFamily: "Raleway, sans-serif", color: "#4b5563" }}
              >
                This is where users will review selected assets and submit the
                lead form (Name, Company, Email) before we send the consolidated
                download email and push details into Zoho CRM.
              </p>
              <div className="text-xs text-gray-500">
                We&apos;ll implement this as a dedicated `/cart` page and header
                icon, backed by a lightweight API route for email delivery and
                CRM sync.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

