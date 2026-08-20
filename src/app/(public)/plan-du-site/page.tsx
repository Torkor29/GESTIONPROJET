import type { Metadata } from "next";
import Link from "next/link";
import { REFERENTIELS } from "@/lib/referentiels";
import {
  CHEMINS_CATEGORIE,
  LIBELLES_CATEGORIE,
  articlesDe,
  cheminArticle,
  type CategorieArticle,
} from "@/lib/contenu-public";

export const metadata: Metadata = {
  title: "Plan du site — Vigie",
  description:
    "Plan du site public de Vigie : présentation, métiers, guides, cas d'usage, articles, ressources, référentiels réglementaires, aide, mentions légales.",
  alternates: { canonical: "/plan-du-site" },
};

const FIXES: { href: string; libelle: string }[] = [
  { href: "/", libelle: "Présentation" },
  { href: "/a-propos", libelle: "À propos" },
  { href: "/fonctionnement", libelle: "Fonctionnement" },
  { href: "/methodologie", libelle: "Méthodologie de suivi" },
  { href: "/comparatif", libelle: "Ce que Vigie est / n'est pas" },
  { href: "/equipe", libelle: "Équipe et rôles" },
  { href: "/glossaire", libelle: "Glossaire" },
  { href: "/reglementaire", libelle: "Référentiels réglementaires" },
  { href: "/questions-frequentes", libelle: "Questions fréquentes" },
  { href: "/aide", libelle: "Aide" },
  { href: "/changelog", libelle: "Journal des versions" },
  { href: "/donnees", libelle: "Données et sécurité" },
  { href: "/securite", libelle: "Sécurité de l'instance" },
  { href: "/hebergement", libelle: "Hébergement" },
  { href: "/confidentialite", libelle: "Confidentialité" },
  { href: "/cgu", libelle: "Conditions d'utilisation" },
  { href: "/accessibilite", libelle: "Accessibilité" },
  { href: "/contact", libelle: "Contact" },
  { href: "/mentions-legales", libelle: "Mentions légales" },
  { href: "/connexion", libelle: "Connexion (espace de travail)" },
];

const RUBRIQUES: CategorieArticle[] = [
  "metiers",
  "guides",
  "cas-usage",
  "actualites",
  "ressources",
];

export default function PagePlanDuSite() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Navigation</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">Plan du site</h1>
      <p className="mt-5 text-lg leading-relaxed text-attenue">
        Toutes les pages publiques de cette instance. L&apos;application
        authentifiée (études, queries, documents) n&apos;y figure pas : elle
        n&apos;est accessible qu&apos;avec un compte.
      </p>

      <section className="mt-12">
        <h2 className="font-titre text-2xl font-bold">Pages d&apos;orientation</h2>
        <ul className="mt-4 columns-1 gap-x-8 sm:columns-2">
          {FIXES.map((l) => (
            <li key={l.href} className="break-inside-avoid pb-2">
              <Link href={l.href} className="text-accent hover:underline">
                {l.libelle}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {RUBRIQUES.map((cat) => (
        <section key={cat} className="mt-12">
          <h2 className="font-titre text-2xl font-bold">
            <Link href={CHEMINS_CATEGORIE[cat]} className="hover:text-accent">
              {LIBELLES_CATEGORIE[cat]}
            </Link>
          </h2>
          <ul className="mt-4 space-y-2">
            {articlesDe(cat).map((a) => (
              <li key={a.slug}>
                <Link href={cheminArticle(a)} className="text-accent hover:underline">
                  {a.titre}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-12">
        <h2 className="font-titre text-2xl font-bold">Référentiels détaillés</h2>
        <ul className="mt-4 space-y-2">
          {REFERENTIELS.map((r) => (
            <li key={r.cle}>
              <Link href={`/reglementaire/${r.cle}`} className="text-accent hover:underline">
                {r.nom}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
