import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Les deux polices sont téléchargées à la construction et servies depuis le
// serveur de l'application : aucune requête vers un tiers à l'exécution.
const texte = Inter({
  subsets: ["latin"],
  variable: "--police-texte",
  display: "swap",
});

const titre = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--police-titre",
  display: "swap",
});

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
    <html lang="fr" className={`${texte.variable} ${titre.variable}`}>
      <body>{children}</body>
    </html>
  );
}
