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
  title: "GoVisitCity - Découvrez votre ville",
  description: "Explorez les meilleures activités et expériences dans votre ville avec GoVisitCity. Itinéraires personnalisés, recommandations IA, et bien plus encore.",
  keywords: ["GoVisitCity", "voyage", "activités", "ville", "exploration", "itinéraire", "tourisme", "IA", "Next.js"],
  authors: [{ name: "GoVisitCity Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    title: "GoVisitCity - Découvrez votre ville",
    description: "Explorez les meilleures activités et expériences dans votre ville avec GoVisitCity",
    url: "https://govisitcity.vercel.app",
    siteName: "GoVisitCity",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "GoVisitCity Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoVisitCity - Découvrez votre ville",
    description: "Explorez les meilleures activités et expériences dans votre ville",
    images: ["/logo.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
