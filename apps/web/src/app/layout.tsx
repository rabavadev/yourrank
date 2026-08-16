import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YourRank — Sites, Telegram, Credits & Shop for streamers",
  description:
    "YourRank connects a branded streamer site, Telegram community tools, and Kick-powered viewer credits and shop in one simple suite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
