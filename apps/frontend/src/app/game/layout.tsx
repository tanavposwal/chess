import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <Toaster position="top-right" reverseOrder={true} />
      {children}
    </SessionProvider>
  );
}
