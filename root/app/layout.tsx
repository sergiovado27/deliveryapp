import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Cambiamos Geist por Inter
import "@/app/globals.css";

// Configuramos Inter en lugar de Geist
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Delivery App",
  description: "Creado por Sergio Vado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}