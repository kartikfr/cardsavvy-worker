import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { TelemetryProvider } from "@/components/providers/TelemetryProvider";
import { NavBar } from "@/components/landing/NavBar";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CardSavvy | India's Smartest Credit Card Recommendation Engine",
  description: "Find the credit card that saves you the most money based on how you actually spend. Free, no login required.",
  openGraph: {
    title: "CardSavvy — India's Smartest Credit Card Engine",
    description: "Compare 50+ premium Indian credit cards. Get your personalised savings report in 2 minutes.",
    locale: "en_IN",
    type: "website",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <TelemetryProvider>
          <NavBar />
          {children}
        </TelemetryProvider>
      </body>
    </html>
  );
}

