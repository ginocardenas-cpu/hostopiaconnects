import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bundle HTML decks into the export API lambda so branded exports can read
  // sources on Vercel without HTTP (deployment protection returns a login page).
  // Next 14 requires this under `experimental` (top-level is Next 15+).
  experimental: {
    outputFileTracingIncludes: {
      "/api/export": [
        "./public/assets/Professional Logo Design *.html",
        "./public/assets/editable/professional-logo-design-*/**/*",
      ],
    },
  },
};

export default withNextIntl(nextConfig);

