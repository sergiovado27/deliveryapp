import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Cambiamos a Poppins
import "@/app/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700", "900"], // Cargamos los pesos que usas
  variable: "--font-poppins",    // Cambiamos el nombre de la variable
});

export const metadata: Metadata = {
  title: "Monchoxpress",
  description: "Creado por Sergio Vado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="font-sans min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}