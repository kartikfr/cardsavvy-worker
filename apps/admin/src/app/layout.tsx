import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminSidebar } from "@/components/AdminSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ subsets: ["latin"], variable: "--font-display" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CardSavvy Admin | Control Center",
  description: "Internal control center for CardSavvy recommendation engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[#0a0a0a] text-foreground`}>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
