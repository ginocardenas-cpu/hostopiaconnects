import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Hostopia Connects",
  description: "Sales and marketing enablement hub for Hostopia partners and teams.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
