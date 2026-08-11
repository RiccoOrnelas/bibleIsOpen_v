import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import DesktopSidebar from "@/components/DesktopSidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Nav_botton from "@/components/Navb";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bible Is Open",
  description: "Seu companheiro de fé diária para leitura devocional e exploração bíblica",
    icons: {
      icon: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
      ],
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          {/* Desktop Layout */}
          <div className="hidden md:flex h-full">
            <DesktopSidebar />
            <div className="flex flex-col flex-1 min-h-0">
              <main className="flex-1 overflow-y-auto bg-[var(--background)]">{children}</main>
              <Footer />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col min-h-full">
            <Header />
            <main className="flex-1 pt-16 pb-16 bg-[var(--background)] overflow-y-auto">{children}</main>
            <Nav_botton />
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
