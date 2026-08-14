import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Spokes — Hertfordshire route",
  description: "A provisional traffic-avoidant MTB route through Hertfordshire.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
