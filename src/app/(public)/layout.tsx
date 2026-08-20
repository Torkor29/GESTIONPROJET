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

const NAV_PRINCIPALE = [
  { href: "/a-propos", libelle: "À propos" },
  { href: "/metiers", libelle: "Métiers" },
  { href: "/guides", libelle: "Guides" },
  { href: "/reglementaire", libelle: "Référentiels" },
  { href: "/actualites", libelle: "Articles" },
  { href: "/questions-frequentes", libelle: "FAQ" },
];

const PIED: { titre: string; liens: { href: string; libelle: string }[] }[] = [
  {
    titre: "Produit",
    liens: [
      { href: "/", libelle: "Présentation" },
      { href: "/a-propos", libelle: "À propos" },
      { href: "/fonctionnement", libelle: "Fonctionnement" },
      { href: "/methodologie", libelle: "Méthodologie" },
      { href: "/comparatif", libelle: "Ce que c'est / n'est pas" },
      { href: "/changelog", libelle: "Versions" },
    ],
  },
  {
    titre: "Documentation",
    liens: [
      { href: "/metiers", libelle: "Métiers" },
      { href: "/guides", libelle: "Guides" },
      { href: "/cas-usage", libelle: "Cas d'usage" },
      { href: "/ressources", libelle: "Ressources" },
      { href: "/glossaire", libelle: "Glossaire" },
      { href: "/aide", libelle: "Aide" },
      { href: "/questions-frequentes", libelle: "Questions fréquentes" },
    ],
  },
  {
    titre: "Cadre",
    liens: [
      { href: "/reglementaire", libelle: "Référentiels" },
      { href: "/donnees", libelle: "Données" },
      { href: "/securite", libelle: "Sécurité" },
      { href: "/hebergement", libelle: "Hébergement" },
      { href: "/equipe", libelle: "Équipe et rôles" },
    ],
  },
  {
    titre: "Légal",
    liens: [
      { href: "/mentions-legales", libelle: "Mentions légales" },
      { href: "/confidentialite", libelle: "Confidentialité" },
      { href: "/cgu", libelle: "Conditions d'utilisation" },
      { href: "/accessibilite", libelle: "Accessibilité" },
      { href: "/contact", libelle: "Contact" },
      { href: "/plan-du-site", libelle: "Plan du site" },
    ],
  },
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

const DONNEES_STRUCTUREES = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Vigie",
      inLanguage: "fr",
      url: SITE_URL,
      description:
        "Site d'information et application de gestion de projet pour les équipes de recherche clinique hospitalière.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Vigie",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Gestion de projet en recherche clinique",
      operatingSystem: "Navigateur web",
      inLanguage: "fr",
      url: SITE_URL,
      description:
        "Outil de gestion de projet destiné aux équipes de recherche clinique hospitalière : suivi des études et des missions, checklists réglementaires, archivage documentaire TMF, monitorage, queries, budget et suivi du temps.",
      audience: {
        "@type": "Audience",
        audienceType:
          "Attachés de recherche clinique, techniciens d'étude clinique, data managers, chefs de projet en recherche clinique, investigateurs",
      },
      featureList: [
        "Suivi des études cliniques",
        "Centres investigateurs et visites de monitoring",
        "Sujets identifiés par Subject ID",
        "Queries et revue de données",
        "Checklists réglementaires RIPH, règlement UE 536/2014, MDR, IVDR, ICH E6(R3), CNIL",
        "Archivage documentaire Trial Master File",
        "Écarts, actions correctives et préventives",
        "Budget, conventions et suivi du temps",
      ],
    },
  ],
};

export default function LayoutPublic({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DONNEES_STRUCTUREES) }}
      />
      <header className="sticky top-0 z-20 border-b border-ligne/70 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" aria-label="Vigie — accueil">
            <Marque />
          </Link>

          <nav
            aria-label="Pages publiques"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_PRINCIPALE.map((l) => (
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
        <nav
          aria-label="Pages publiques (compact)"
          className="flex gap-1 overflow-x-auto border-t border-ligne/50 px-4 py-2 lg:hidden"
        >
          {NAV_PRINCIPALE.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] text-attenue hover:bg-relief hover:text-encre"
            >
              {l.libelle}
            </Link>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="border-t border-ligne px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Marque petite />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-efface">
                Logiciel de gestion de projet pour les équipes de recherche
                clinique hospitalière. Études, centres, queries, monitoring,
                documents TMF, checklists réglementaires. Auto-hébergé, en
                français.
              </p>
              <p className="mt-3 text-sm">
                <Link href="/connexion" className="text-accent hover:underline">
                  Connexion à l&apos;espace de travail
                </Link>
              </p>
            </div>
            {PIED.map((col) => (
              <nav key={col.titre} aria-label={col.titre}>
                <p className="font-titre text-sm font-bold">{col.titre}</p>
                <ul className="mt-3 space-y-1.5">
                  {col.liens.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-attenue transition-colors hover:text-accent"
                      >
                        {l.libelle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <p className="mt-10 text-xs leading-relaxed text-efface">
            Vigie est une aide au travail, pas un avis réglementaire ni une
            attestation de conformité. Les textes officiels (ANSM, CPP, CNIL,
            EMA, EUR-Lex, Légifrance, ICH) prévalent.{" "}
            <Link href="/plan-du-site" className="hover:text-accent">
              Plan du site
            </Link>
            {" · "}
            <Link href="/mentions-legales" className="hover:text-accent">
              Mentions légales
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
