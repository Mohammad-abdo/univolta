import type { Metadata } from "next";
import { Geist, Geist_Mono, Alexandria } from "next/font/google";
import "./globals.css";
import { DirectionProvider } from "@/components/direction-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Primary UI font — Latin + Arabic (replaces Montserrat site-wide) */
const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UniVolta - Study Abroad Made Easy",
  description:
    "Connect with top international universities and get personalized support throughout your application journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${alexandria.variable} antialiased`}
      >
        <DirectionProvider>{children}</DirectionProvider>
      </body>
    </html>
  );
}
