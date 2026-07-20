import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bundle HTML decks + Chromium into the export API lambda so branded PDF
  // exports work on Vercel (deployment protection blocks HTTP fetches of assets).
  // Next 14 requires tracing includes under `experimental` (top-level is Next 15+).
  experimental: {
    serverComponentsExternalPackages: [
      "@sparticuz/chromium",
      "playwright-core",
      "playwright",
    ],
    outputFileTracingIncludes: {
      "/api/export": [
        "./public/assets/Professional Logo Design *.html",
        "./public/assets/editable/professional-logo-design-*/**/*",
        "./node_modules/@sparticuz/chromium/**/*",
      ],
    },
  },
};

export default withNextIntl(nextConfig);

