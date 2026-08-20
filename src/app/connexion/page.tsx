import Link from "next/link";
import { redirect } from "next/navigation";
import { aucunCompte, estConnecte } from "@/lib/auth";
import { Icone } from "@/components/icones";
import FormulaireConnexion from "./formulaire";

export const dynamic = "force-dynamic";

export default async function PageConnexion() {
  if (await estConnecte()) redirect("/bord");
  if (aucunCompte()) redirect("/inscription");

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
      />

      <div className="relative mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_22rem]">
        <section className="max-w-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-titre text-lg font-bold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sur-accent shadow-douce">
              <Icone nom="eclair" className="h-4.5 w-4.5" />
            </span>
            Vigie
          </Link>
          <h1 className="mt-8 font-titre text-3xl font-bold sm:text-4xl">
            Espace de travail des études cliniques
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-attenue">
            Vigie est un logiciel de gestion de projet en recherche clinique :
            suivi des études, des centres, des sujets (Subject ID), des queries,
            du monitoring et des documents. L&apos;accès aux dossiers est réservé
            aux comptes de l&apos;établissement.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-attenue">
            <li>Chef de projet — portefeuille, jalons, risques</li>
            <li>Data Manager — queries, data review, CRF</li>
            <li>ARC — centres, visites de monitoring, déviations</li>
            <li>Investigateur — sujets du centre, queries à répondre</li>
          </ul>
          <p className="mt-6 text-sm">
            <Link href="/a-propos" className="text-accent">
              À propos
            </Link>
            {" · "}
            <Link href="/fonctionnement" className="text-accent">
              Fonctionnement
            </Link>
            {" · "}
            <Link href="/glossaire" className="text-accent">
              Glossaire
            </Link>
            {" · "}
            <Link href="/donnees" className="text-accent">
              Données et sécurité
            </Link>
          </p>
        </section>

        <section>
          <h2 className="font-titre text-xl font-bold">Connexion</h2>
          <p className="mt-1.5 text-sm text-attenue">
            Compte professionnel. En démonstration, les identifiants sont
            indiqués dans Administration une fois le jeu chargé.
          </p>
          <div className="mt-6">
            <FormulaireConnexion />
          </div>
        </section>
      </div>
    </main>
  );
}
