import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Fatoura - Factuur Beheer",
  description: "Factuur beheer systeem voor omzet en uurloon berekeningen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-900">
        <div className="min-h-screen">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
