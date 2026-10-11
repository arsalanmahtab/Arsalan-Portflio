import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope, Syne } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { Grain } from "@/components/layout/Grain";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Providers } from "@/components/providers/Providers";
import { site } from "@/config/site";
import { contactLabels } from "@/data/contact";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}, software engineer and Shopify developer`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0a1a" },
    { media: "(prefers-color-scheme: light)", color: "#f4f2fb" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={clsx(syne.variable, manrope.variable, instrumentSerif.variable)}>
      <body>
        <a
          href="#main"
          className="fixed top-3 left-3 z-110 translate-y-[-200%] rounded-full bg-lime px-5 py-3 font-bold text-on-lime focus-visible:translate-y-0"
        >
          {contactLabels.skipLink}
        </a>
        <AmbientBackground />
        <ScrollProgress />
        <Providers>
          <Navbar />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
        <Cursor />
        <Grain />
      </body>
    </html>
  );
}
