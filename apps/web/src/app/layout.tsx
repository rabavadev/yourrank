import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YourRank — Sites, Telegram, Credits & Shop for streamers",
  description:
    "YourRank connects a branded streamer site, Telegram community tools, and Kick-powered viewer credits and shop in one simple suite.",
};

const DESIGN_CONTRACT = {
  THESIS: "One quiet, high-contrast language makes YourRank's connected community suite immediately legible.",
  "OWN-WORLD": "Near-white fields, black type, electric-violet actions, hairline dividers, restrained geometry, and readable product surfaces.",
  STORY: "A visitor understands the Sites, Telegram, and Credits loop, sees the product in use, and can start or explore without detours.",
  "FIRST VIEWPORT": "Compact navigation, one decisive heading, visible actions, and an illustrative product surface lead every marketing route.",
  FORM: "Devin-reference marketing system, seed 562938e8; devin.ai governs material and hierarchy while YourRank branding, copy, and product truth remain original.",
  FINISH: "Every shipped surface is reviewed at desktop and mobile, documented in DESIGN.md, and held to the shared accessibility and responsive floor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body
        data-design-contract="yourrank-devin-reference-2026"
        className="bg-canvas text-ink font-sans antialiased"
      >
        <script
          id="yourrank-design-contract"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(DESIGN_CONTRACT) }}
        />
        {children}
      </body>
    </html>
  );
}
