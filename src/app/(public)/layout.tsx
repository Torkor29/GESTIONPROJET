import Link from "next/link";
import { Icone } from "@/components/icones";
import { SITE_URL } from "@/lib/site";

/**
 * Enveloppe des pages publiques.
 *
 * L'en-tête et le pied de page portent les mêmes liens sur toutes les pages :
 * un visiteur arrivé sur n'importe laquelle atteint les autres en un clic, et
 * un robot qui n'explore qu'une seule adresse découvre quand même l'ensemble
 * du site.
 */

const LIENS = [
  { href: "/", libelle: "Présentation" },
  { href: "/a-propos", libelle: "À propos" },
  { href: "/fonctionnement", libelle: "Fonctionnement" },
  { href: "/glossaire", libelle: "Glossaire" },
  { href: "/reglementaire", libelle: "Référentiels" },
  { href: "/donnees", libelle: "Données et sécurité" },
  { href: "/aide", libelle: "Aide" },
  { href: "/changelog", libelle: "Versions" },
  { href: "/confidentialite", libelle: "Confidentialité" },
  { href: "/mentions-legales", libelle: "Mentions légales" },
];

function Marque({ petite = false }: { petite?: boolean }) {
  return (
    <span
      className={`flex items-center gap-2.5 font-titre font-bold tracking-tight ${
        petite ? "text-sm" : "text-[15px]"
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-[10px] bg-accent text-sur-accent ${
          petite ? "h-6 w-6" : "h-8 w-8 shadow-douce"
        }`}
      >
        <Icone nom="eclair" className={petite ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </span>
      Vigie
    </span>
  );
}

/**
 * Description lisible par une machine de ce qu'est ce site.
 *
 * Un moteur de catégorisation qui ne saurait pas quoi faire du texte trouve
 * ici, en clair, la nature du site et sa catégorie : logiciel de gestion de
 * projet à destination professionnelle.
 */
const DONNEES_STRUCTUREES = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Vigie",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Gestion de projet en recherche clinique",
  operatingSystem: "Navigateur web",
  inLanguage: "fr",
  url: SITE_URL,
  description:
    "Outil de gestion de projet destiné aux équipes de recherche clinique hospitalière : suivi des études et des missions, checklists réglementaires, archivage documentaire TMF, monitorage, budget et suivi du temps.",
  audience: {
    "@type": "Audience",
    audienceType:
      "Attachés de recherche clinique, techniciens d'étude clinique, chefs de projet en recherche clinique",
  },
  featureList: [
    "Suivi des études cliniques",
    "Checklists réglementaires RIPH, règlement UE 536/2014, MDR, IVDR, ICH E6(R3), CNIL",
    "Gestion des missions et des échéances",
    "Archivage documentaire Trial Master File",
    "Visites de monitorage, écarts et actions correctives",
    "Budget et conventions",
    "Suivi du temps et indicateurs",
  ],
};

export default function LayoutPublic({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <script
        type="application/ld+json"
        // Contenu constant écrit dans ce fichier : aucune donnée extérieure
        // n'entre dans cette sérialisation.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DONNEES_STRUCTUREES) }}
      />
      <header className="sticky top-0 z-20 border-b border-ligne/70 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" aria-label="Vigie — accueil">
            <Marque />
          </Link>

          <nav aria-label="Pages publiques" className="hidden items-center gap-1 lg:flex">
            {[
              { href: "/a-propos", libelle: "À propos" },
              { href: "/fonctionnement", libelle: "Fonctionnement" },
              { href: "/glossaire", libelle: "Glossaire" },
              { href: "/reglementaire", libelle: "Référentiels" },
              { href: "/donnees", libelle: "Données" },
              { href: "/aide", libelle: "Aide" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-[13px] text-attenue transition-colors hover:bg-relief hover:text-encre"
              >
                {l.libelle}
              </Link>
            ))}
          </nav>

          <Link href="/connexion" className="bouton-discret !py-2 text-[13px]">
            Se connecter
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-ligne px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Marque petite />
            <p className="mt-2 max-w-sm text-sm text-efface">
              Outil de gestion de projet pour les équipes de recherche clinique
              hospitalière. Suivi des études, des missions, des obligations
              réglementaires et du temps passé.
            </p>
          </div>

          <nav aria-label="Plan du site" className="flex flex-col gap-1.5">
            {LIENS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-attenue transition-colors hover:text-accent"
              >
                {l.libelle}
              </Link>
            ))}
            <Link
              href="/connexion"
              className="text-sm text-attenue transition-colors hover:text-accent"
            >
              Connexion
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
