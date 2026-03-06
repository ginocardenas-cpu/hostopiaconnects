import Link from "next/link";

export const metadata = {
  title: "How Hostopia Connects Works",
  description: "Add assets to My Resources, then get a single download bundle in your inbox."
};

export default function HowItWorksPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <p
            className="uppercase tracking-[0.2em] text-xs mb-3 text-gray-500"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            How Hostopia Connects Works
          </p>
          <h1
            className="font-black leading-tight mb-4"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#24282B"
            }}
          >
            Add assets to My Resources, then get a single{" "}
            <span style={{ color: "#2CADB2" }}>download bundle</span> in your inbox.
          </h1>
          <p
            className="text-base md:text-lg text-gray-600 max-w-xl"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Hostopia Connects is public to browse. When you&apos;re ready to download,
            you&apos;ll add assets to My Resources and request them in one step.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2CADB2] hover:underline"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          ← Back to home
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-12">
        {[
          {
            step: "1",
            title: "Browse",
            description: "Explore by product journey, content type, or use case. Preview documents when available before adding to My Resources."
          },
          {
            step: "2",
            title: "Add to My Resources",
            description: "On any asset detail page, add the items you want. Review your selection on the My Resources page."
          },
          {
            step: "3",
            title: "Request your bundle",
            description: "Submit your name, company, and email once. We&apos;ll email you secure, time-limited links for every asset in your bundle."
          }
        ].map((item) => (
          <div
            key={item.step}
            className="rounded-2xl border border-black/5 bg-white p-6"
          >
            <span
              className="inline-block text-3xl font-black mb-3"
              style={{ fontFamily: "Montserrat, sans-serif", color: "#2CADB2" }}
            >
              {item.step}
            </span>
            <h2
              className="font-black mb-2"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "1.25rem",
                color: "#24282B"
              }}
            >
              {item.title}
            </h2>
            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#2CADB2]/30 bg-[#f0fbfa] p-6">
        <h2
          className="font-black mb-3"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "1.25rem",
            color: "#24282B"
          }}
        >
          Lead capture
        </h2>
        <p
          className="text-sm text-gray-700 mb-4"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          We capture just three fields – <strong>Full Name</strong>, <strong>Company</strong>, and{" "}
          <strong>Email</strong> – plus an optional marketing opt-in. Your data is used to send the
          download bundle and may be synced to our CRM for follow-up.
        </p>
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-bold"
          style={{
            fontFamily: "Montserrat, sans-serif",
            backgroundColor: "#F8CF41",
            color: "#24282B"
          }}
        >
          Go to My Resources
        </Link>
      </div>
    </section>
  );
}
