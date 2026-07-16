import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bundle HTML decks into the export API lambda so branded exports can read
  // sources on Vercel without HTTP (deployment protection returns a login page).
  outputFileTracingIncludes: {
    "/api/export": [
      "./public/assets/Professional Logo Design *.html",
      "./public/assets/editable/professional-logo-design-*/**/*",
    ],
  },
};

export default withNextIntl(nextConfig);

