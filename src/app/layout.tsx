import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
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
  // Nécessaire pour que les `canonical` relatifs des pages publiques se
  // résolvent en adresses absolues dans le HTML rendu.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vigie — Gestion de projet en recherche clinique",
    template: "%s",
  },
  description:
    "Vigie est un outil de gestion de projet destiné aux équipes de recherche clinique hospitalière : suivi des études et des missions, checklists réglementaires (RIPH, règlement UE 536/2014, MDR, IVDR, ICH E6(R3), CNIL), archivage documentaire TMF, monitorage, budget et suivi du temps.",
  keywords: [
    "gestion de projet recherche clinique",
    "suivi d'étude clinique",
    "checklist réglementaire RIPH",
    "règlement UE 536/2014",
    "ICH E6(R3)",
    "Trial Master File",
    "monitorage clinique",
    "attaché de recherche clinique",
    "technicien d'étude clinique",
    "chef de projet recherche clinique",
    "CHU recherche clinique",
  ],
  applicationName: "Vigie",
  authors: [{ name: "Vigie" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Vigie",
    locale: "fr_FR",
    url: SITE_URL,
    title: "Vigie — Gestion de projet en recherche clinique",
    description:
      "Suivi des études et des missions, checklists réglementaires, documents TMF, monitorage, budget et temps passé, pour les équipes de recherche clinique hospitalière.",
  },
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
