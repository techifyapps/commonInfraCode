import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECIChatAgent",
  description: "ECI Knowledge Assistant - Chat application for Enriched Customer Information",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
