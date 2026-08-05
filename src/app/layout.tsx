import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestion de projet en recherche clinique",
  description:
    "Outil professionnel de suivi d'études cliniques : missions, documents, checklists réglementaires (RIPH, règlement 536/2014, MDR, IVDR, ICH E6(R3), CNIL) et pages de travail par étude.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
