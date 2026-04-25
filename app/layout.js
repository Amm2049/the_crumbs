import { Quicksand } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/shared/SessionProvider";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
});

export const metadata = {
  title: "The Crumbs | Bakery",
  description: "Freshly baked goods every day.",
  icons: {
    icon: "/the_crumbs_logo.png",
    shortcut: "/the_crumbs_logo.png",
    apple: "/the_crumbs_logo.png",
  },
};

import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full antialiased`} suppressHydrationWarning>
      <body className={`${quicksand.className} min-h-full flex flex-col`}>
        <ThemeProvider>
          <NextAuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
