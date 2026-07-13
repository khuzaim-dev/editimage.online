import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/AppSidebar";
import { TopHeader } from "@/components/TopHeader";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | editimage.online",
    default: "editimage.online — Free Online Image Processing Tools",
  },
  description:
    "Resize, compress, convert, crop, and enhance images instantly — fast, free, and privacy-first. No signup required.",
  keywords: ["image resize", "compress image", "convert image", "crop image", "remove background", "image tools", "free image editor"],
  openGraph: {
    title: "editimage.online — Free Online Image Processing Tools",
    description: "All-in-One image toolkit. Free, fast, privacy-first.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <body className="h-full flex bg-background text-foreground">
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Right: Main content */}
        <div className="flex-1 flex flex-col min-h-full overflow-x-hidden">
          <TopHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
