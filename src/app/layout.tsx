import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { DESCRIPTION_SEO, NOM_PRODUIT, SITE_URL } from "@/lib/site";
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
    default: `${NOM_PRODUIT} — Espace de travail de la recherche clinique`,
    template: "%s",
  },
  description: DESCRIPTION_SEO,
  keywords: [
    "recherche clinique",
    "espace de travail recherche clinique",
    "outil métier recherche clinique",
    "suivi d'étude clinique",
    "gestion de l'activité clinique",
    "opérations cliniques",
    "attaché de recherche clinique",
    "technicien d'étude clinique",
    "chef de projet recherche clinique",
    "checklist réglementaire RIPH",
    "Trial Master File",
    "monitorage clinique",
  ],
  applicationName: NOM_PRODUIT,
  authors: [{ name: NOM_PRODUIT }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: NOM_PRODUIT,
    locale: "fr_FR",
    url: SITE_URL,
    title: `${NOM_PRODUIT} — Espace de travail de la recherche clinique`,
    description: DESCRIPTION_SEO,
  },
  twitter: {
    card: "summary",
    title: `${NOM_PRODUIT} — Espace de travail de la recherche clinique`,
    description: DESCRIPTION_SEO,
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
