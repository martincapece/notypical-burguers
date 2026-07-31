import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { FloatingWhatsAppButton } from "@/components/floating-whatsapp";
import { Footer } from "@/components/footer";
import "./globals.css";

const titleFont = Bebas_Neue({
  variable: "--font-title",
  weight: "400",
  subsets: ["latin"],
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NO TYPICAL | Burgers & Fries",
  description: "Hamburguesas smash. Crispy. Juicy. Different. Not for everyone. Pide ahora en línea.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${titleFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsAppButton />
      </body>
    </html>
  );
}
