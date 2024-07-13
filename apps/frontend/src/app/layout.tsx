import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

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
      <body
        className={
          inter.className + " bg-stone-800 text-white w-full min-h-screen"
        }
      >
        <Toaster position="top-right" reverseOrder={true} />
        {children}
      </body>
    </html>
  );
}
