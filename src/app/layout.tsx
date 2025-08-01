import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ProfileProvider } from "../contexts/ProfileContext";
import { Navbar } from "../components/layout/Navbar";
import { SummarySidebar } from "../components/ui/summary-sidebar";
import { SummaryProvider } from "@/contexts/SummaryContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SummaryProvider>
            <ProfileProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <SummarySidebar />
              </div>
            </ProfileProvider>
          </SummaryProvider>
        </Providers>
      </body>
    </html>
  );
}
