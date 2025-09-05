import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import OfflineStatus from "@/components/OfflineStatus";
import InstallPrompt from "@/components/InstallPrompt";
import MobileOptimizer from "@/components/MobileOptimizer";
import OfflineCapabilities from "@/components/OfflineCapabilities";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My DTR",
  description:
    "Offline-first Daily Time Record (DTR) web application for tracking work hours, built with Next.js and IndexedDB",
  themeColor: "#8C1007",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/dtr-logo.ico" },
    { rel: "apple-touch-icon", url: "/dtr-logo.png" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DTR App",
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#8C1007" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DTR App" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#8C1007" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/mydtr.ico" />
        <link rel="apple-touch-icon" href="/dtr-logo.png" />
        <link rel="mask-icon" href="/mydtr.ico" color="#8C1007" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ServiceWorkerRegister />
        <OfflineStatus />
        <InstallPrompt />
        <MobileOptimizer />
        <OfflineCapabilities />
      </body>
    </html>
  );
}
