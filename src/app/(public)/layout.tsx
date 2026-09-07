import Link from "next/link";
import { EnTetePublic } from "@/components/public/en-tete";
import { Marque } from "@/components/marque";
import {
  ACCROCHE,
  DESCRIPTION_COURTE,
  LIENS_PUBLICS,
  NOM_PRODUIT,
  SITE_URL,
} from "@/lib/site";

/**
 * Enveloppe des pages publiques.
 *
 * L'en-tête et le pied de page portent les mêmes liens sur toutes les pages :
 * un visiteur arrivé sur n'importe laquelle atteint les autres en un clic, et
 * un robot qui n'explore qu'une seule adresse découvre quand même l'ensemble
 * du site.
 */

/**
 * Description lisible par une machine de ce qu'est ce site.
 *
 * Un moteur de catégorisation qui ne saurait pas quoi faire du texte trouve
 * ici, en clair, la nature du site : logiciel métier de suivi d'activité
 * en recherche clinique.
 */
const DONNEES_STRUCTUREES = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: NOM_PRODUIT,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Espace de travail pour la recherche clinique",
  operatingSystem: "Navigateur web",
  inLanguage: "fr",
  url: SITE_URL,
  description: DESCRIPTION_COURTE,
  audience: {
    "@type": "Audience",
    audienceType:
      "Attachés de recherche clinique, techniciens d'étude clinique, chefs de projet en recherche clinique",
  },
  featureList: [
    "Dossier d'étude clinique",
    "Suivi des missions et des échéances",
    "Checklists réglementaires RIPH, règlement UE 536/2014, MDR, IVDR, ICH E6(R3), CNIL",
    "Archivage documentaire Trial Master File",
    "Visites de monitorage, écarts et actions correctives",
    "Budget et conventions",
    "Portefeuille d'études et charge d'équipe",
    "Suivi du temps et indicateurs d'activité",
  ],
};

export default function LayoutPublic({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-publique min-h-screen bg-surface">
      <script
        type="application/ld+json"
        // Contenu constant écrit dans ce fichier : aucune donnée extérieure
        // n'entre dans cette sérialisation.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DONNEES_STRUCTUREES) }}
      />

      <a href="#contenu" className="lien-evitement">
        Aller au contenu
      </a>

      <EnTetePublic />

      <main id="contenu">{children}</main>

      <footer className="border-t border-ligne px-5 py-16 sm:px-10">
        <div className="mx-auto flex max-w-[1432px] flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Marque petite />
            <p className="mt-4 max-w-sm text-[14px] leading-[1.35] tracking-[-0.02em] text-efface">
              {ACCROCHE}.
            </p>
          </div>

          <nav aria-label="Plan du site" className="flex flex-col gap-3">
            {LIENS_PUBLICS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[14px] uppercase tracking-[-0.02em] text-encre transition-opacity hover:opacity-60"
              >
                {l.libelleLong ?? l.libelle}
              </Link>
            ))}
            <Link
              href="/connexion"
              className="text-[14px] uppercase tracking-[-0.02em] text-encre transition-opacity hover:opacity-60"
            >
              Connexion
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
