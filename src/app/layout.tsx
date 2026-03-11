import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

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
  title: "Chrono \u2014 Your Life, Beautifully Mapped",
  description:
    "Chrono transforms your memories into a stunning visual timeline. A premium digital life story.",
  keywords: ["timeline", "life events", "memories", "digital story"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('chrono-theme');
              if (theme === 'light') {
                document.documentElement.classList.add('light');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="font-body antialiased bg-chrono-bg text-chrono-text">
        <ErrorBoundary>
          <ThemeProvider>
            <ScrollProgressBar />
            <Navigation />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
