import type { Metadata } from "next";
import "./globals.css";
import { SessionAuthProvider } from '@/components/session-auth'
import { Toaster } from 'sonner'
import { QueryClientContext } from '@/providers/queryclient'
import { Inter, Poppins } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Odonto PRO - Encontre os melhores profissionais em um único local!",
  description: "Nós somos uma plataforma para profissionais da saúde com foco em agilizar seu atendimento de forma simplificada e organizada.",
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  openGraph: {
    title: "Odonto PRO - Encontre os melhores profissionais em um único local!",
    description: "Nós somos uma plataforma para profissionais da saúde com foco em agilizar seu atendimento de forma simplificada e organizada.",
    images: [`${process.env.NEXT_PUBLIC_URL}/doctor-hero.png`]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionAuthProvider>
          <QueryClientContext>
            <Toaster
              duration={2500}
            />
            {children}
          </QueryClientContext>
        </SessionAuthProvider>
      </body>
    </html>
  );
}
