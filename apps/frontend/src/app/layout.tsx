import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chess",
  description: "Chess game by tanav",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " h-screen bg-stone-900 text-white"}>
      <SessionProvider>
        <Toaster position="top-right" reverseOrder={true} />
        {children}
      </SessionProvider>
      </body>
    </html>
  );
}
