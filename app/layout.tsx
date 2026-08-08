import type { Metadata, Viewport } from "next";
import { Baloo_2, Work_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toaster";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-worksans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PetTag — identificação inteligente para o seu pet",
  description:
    "Cadastre fotos, vacinas e contato do seu pet numa identificação NFC. Quem encontrar seu cachorro só precisa aproximar o celular.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#efeee0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${workSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink font-body">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
