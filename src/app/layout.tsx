import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";
import { UserProvider } from "@/contexts/UserContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-ono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart PT - Public Transport Assistant",
  description: "Real-time occupancy tracking and smart transit assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`}
          strategy="beforeInteractive"
        />
        <Script
          id="resize-observer-error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress ResizeObserver loop errors
              const originalError = console.error;
              console.error = (...args) => {
                if (args[0] && args[0].includes && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
                  return;
                }
                originalError.apply(console, args);
              };
              
              // Also handle unhandled promise rejections
              window.addEventListener('unhandledrejection', (event) => {
                if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver loop completed with undelivered notifications')) {
                  event.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <Navigation />
          {children}
          <ChatWidget />
        </UserProvider>
      </body>
    </html>
  );
}
