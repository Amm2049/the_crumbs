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
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full antialiased`}>
      <body suppressHydrationWarning className={`${quicksand.className} min-h-full flex flex-col`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
