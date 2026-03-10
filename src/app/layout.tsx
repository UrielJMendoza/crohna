import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-body",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-display",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Chrono — Your Life, Beautifully Mapped",
  description:
    "Chrono transforms your memories into a stunning visual timeline. AI-powered digital life story.",
  keywords: ["timeline", "life events", "AI", "memories", "digital story"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-body antialiased bg-chrono-bg text-chrono-text">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
