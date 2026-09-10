import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Roboto_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Atelier Artizan",
    template: "%s | Atelier Artizan",
  },
  description:
    "Design House handcrafting luxury outdoor furniture in Tennessee. Engineered for the Elements, Built to Last Generations.",
  keywords: [
    "luxury outdoor furniture",
    "handmade furniture",
    "outdoor living",
    "heritage collection",
    "artisan furniture",
    "carbon steel furniture",
  ],
  openGraph: {
    title: "Atelier Artizan",
    description:
      "Design House handcrafting luxury outdoor furniture in Tennessee. Engineered for the Elements, Built to Last Generations.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${robotoMono.variable} antialiased`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
