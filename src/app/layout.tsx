import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoVisitCity - Votre assistant de voyage intelligent",
  description: "Planifiez vos voyages facilement avec GoVisitCity",
  keywords: ["voyage", "planning", "assistant", "voyageur", "destination"],
  authors: [{ name: "GoVisitCity Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "GoVisitCity - Votre assistant de voyage intelligent",
    description: "Planifiez vos voyages facilement avec GoVisitCity",
    url: "https://govisitcity.com",
    siteName: "GoVisitCity",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoVisitCity - Votre assistant de voyage intelligent",
    description: "Planifiez vos voyages facilement avec GoVisitCity",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
<body 
  className="__variable_188709 __variable_9a8899 antialiased bg-background text-foreground"
  suppressHydrationWarning
>
        {children}
        <Toaster />
      </body>
    </html>
  );
}