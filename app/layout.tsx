import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Bookmark App",
  description: "Bookmark manager with Supabase",
  icons: {
    icon: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
