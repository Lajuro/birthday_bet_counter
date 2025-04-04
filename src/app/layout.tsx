import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./custom-scrollbar.css"; 
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contador de Palpites - Nascimento da Chloe",
  description: "Registre seu palpite para o nascimento da Chloe e acompanhe a contagem regressiva",
  icons: {
    icon: [{ url: "/logo_fill.svg", type: "image/svg+xml" }],
    apple: [{ url: "/logo_fill.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900`}
      >
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Toaster richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
