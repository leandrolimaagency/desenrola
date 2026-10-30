import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desenrola | Um novo começo para suas finanças",
  description: "Conheça possibilidades para organizar sua vida financeira em uma página independente."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
