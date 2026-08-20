import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { aucunCompte, estConnecte } from "@/lib/auth";
import FormulaireConnexion from "./formulaire";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion — Vigie, espace de travail des études cliniques",
  description:
    "Connexion à Vigie, logiciel de gestion de projet en recherche clinique hospitalière. Accès réservé aux comptes invités de l'établissement. Présentation de l'outil, métiers, queries, monitoring et documents TMF.",
  alternates: { canonical: "/connexion" },
};

export default async function PageConnexion() {
  if (await estConnecte()) redirect("/bord");
  if (aucunCompte()) redirect("/inscription");

  return (
    <div className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_22rem]">
        <article>
          <p className="sur-titre">Espace de travail</p>
          <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
            Connexion à l&apos;application de suivi des études
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-attenue">
            Vigie est un logiciel de gestion de projet en recherche clinique,
            destiné aux équipes hospitalières : chefs de projet, data managers,
            attachés de recherche clinique, techniciens d&apos;étude clinique et
            investigateurs. L&apos;accès aux dossiers d&apos;études, aux queries,
            aux visites de monitoring et aux documents du Trial Master File est
            réservé aux comptes de l&apos;établissement, créés par invitation
            nominative.
          </p>
          <p className="mt-4 leading-relaxed text-attenue">
            Cette page n&apos;est pas seulement un formulaire. Elle décrit
            l&apos;outil pour qu&apos;un visiteur — y compris un filtre
            d&apos;entreprise qui n&apos;ouvre que l&apos;adresse de connexion —
            comprenne qu&apos;il s&apos;agit d&apos;un site professionnel
            d&apos;information et d&apos;un logiciel de travail, rédigé en
            français, sans publicité et sans collecte grand public.
          </p>

          <h2 className="mt-10 font-titre text-2xl font-bold">
            Ce que vous ouvrez après authentification
          </h2>
          <ul className="mt-4 space-y-3 text-attenue">
            <li>
              <strong className="text-encre">Chef de projet</strong> — portefeuille
              d&apos;études, jalons réglementaires, risques, charge de l&apos;équipe.
            </li>
            <li>
              <strong className="text-encre">Data manager</strong> — queries
              (ouvertes, répondues, rouvertes, résolues, fermées), revue de
              données, structure CRF, jalons de gel de base.
            </li>
            <li>
              <strong className="text-encre">ARC</strong> — centres, visites de
              mise en place, de routine et de clôture, écarts et actions
              correctives.
            </li>
            <li>
              <strong className="text-encre">Investigateur / TEC</strong> — sujets
              du centre identifiés par un Subject ID, visites protocolaires,
              queries à répondre.
            </li>
          </ul>

          <h2 className="mt-10 font-titre text-2xl font-bold">
            Ce que Vigie n&apos;enregistre pas
          </h2>
          <p className="mt-4 leading-relaxed text-attenue">
            Pas de nom de participant, pas de date de naissance, pas
            d&apos;identifiant national, pas de compte rendu médical. Le suivi
            de projet se fait avec des identifiants d&apos;étude et des
            compteurs. Les données de santé vivent dans le dossier patient et
            dans l&apos;eCRF. Le détail est sur la page{" "}
            <Link href="/donnees" className="text-accent hover:underline">
              Données et sécurité
            </Link>
            .
          </p>

          <h2 className="mt-10 font-titre text-2xl font-bold">
            Pas encore de compte ?
          </h2>
          <p className="mt-4 leading-relaxed text-attenue">
            L&apos;inscription n&apos;est pas ouverte au public. Demandez un
            lien d&apos;invitation à la personne qui pilote l&apos;instance
            (souvent le chef de projet ou l&apos;administrateur). En attendant,
            le site public explique l&apos;outil :{" "}
            <Link href="/a-propos" className="text-accent hover:underline">
              à propos
            </Link>
            ,{" "}
            <Link href="/fonctionnement" className="text-accent hover:underline">
              fonctionnement
            </Link>
            ,{" "}
            <Link href="/metiers" className="text-accent hover:underline">
              métiers
            </Link>
            ,{" "}
            <Link href="/guides" className="text-accent hover:underline">
              guides
            </Link>
            ,{" "}
            <Link href="/glossaire" className="text-accent hover:underline">
              glossaire
            </Link>
            ,{" "}
            <Link href="/reglementaire" className="text-accent hover:underline">
              référentiels
            </Link>
            ,{" "}
            <Link href="/questions-frequentes" className="text-accent hover:underline">
              questions fréquentes
            </Link>
            .
          </p>
          <p className="mt-4 leading-relaxed text-attenue">
            Si cette adresse est bloquée par un filtre web (« trop peu de
            contenu », site non catégorisé), montrez le{" "}
            <Link href="/plan-du-site" className="text-accent hover:underline">
              plan du site
            </Link>{" "}
            et les{" "}
            <Link href="/mentions-legales" className="text-accent hover:underline">
              mentions légales
            </Link>{" "}
            au service informatique. Le fichier{" "}
            <Link href="/sitemap.xml" className="text-accent hover:underline">
              sitemap.xml
            </Link>{" "}
            liste l&apos;ensemble des pages publiques.
          </p>
        </article>

        <aside>
          <div className="lg:sticky lg:top-24">
            <h2 className="font-titre text-xl font-bold">Connexion</h2>
            <p className="mt-1.5 text-sm text-attenue">
              Compte professionnel nominatif. En démonstration, les identifiants
              fictifs sont indiqués dans Administration une fois le jeu chargé.
            </p>
            <div className="mt-6">
              <FormulaireConnexion />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-efface">
              En vous connectant, vous accédez à un outil de travail
              d&apos;établissement. Le cookie déposé sert uniquement à la
              session. Pas de traceur publicitaire.{" "}
              <Link href="/confidentialite" className="text-accent hover:underline">
                Confidentialité
              </Link>
              {" · "}
              <Link href="/cgu" className="text-accent hover:underline">
                Conditions d&apos;utilisation
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
