import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos — Vigie, logiciel de gestion de projet en recherche clinique",
  description:
    "Vigie est un logiciel de gestion de projet destiné aux équipes de recherche clinique hospitalière : chefs de projet, data managers, ARC et investigateurs. Outil auto-hébergé, sans abonnement, pensé pour le suivi d'études et non comme un EDC ou une base de pharmacovigilance.",
  alternates: { canonical: "/a-propos" },
};

export default function PageAPropos() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">À propos</p>
      <h1 className="mt-3 font-titre text-4xl font-bold">Un outil de Clinical Operations, pas un tableur</h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Vigie est un logiciel de gestion de projet en recherche clinique. Il s&apos;adresse
          aux équipes qui conduisent des études : chefs de projet, data managers,
          attachés de recherche clinique, techniciens d&apos;étude clinique et, le cas
          échéant, investigateurs. Il n&apos;est pas un cahier d&apos;observation électronique
          promoteur, ni un système de pharmacovigilance, ni une plateforme de
          randomisation.
        </p>
        <p>
          Le fil conducteur est simple : une étude, des centres, des sujets identifiés
          par un Subject ID, des visites, des données à revoir, des queries, du
          monitoring, des documents, des tâches et des jalons. Chaque objet est
          relié aux autres. Une query ouverte depuis une visite apparaît dans le
          module Queries, sur le sujet, sur le centre, et sur le tableau de bord du
          Data Manager.
        </p>
        <p>
          L&apos;application s&apos;installe sur le serveur de l&apos;établissement. Les données
          restent chez vous. Les comptes sont individuels. Les droits sont gérés
          par rôle côté serveur : masquer un bouton ne suffit pas à autoriser une
          action.
        </p>
        <p>
          Vigie ne prétend pas à lui seul rendre un processus conforme à ICH-GCP,
          au RGPD, à la FDA 21 CFR Part 11 ou au règlement européen sur les essais
          cliniques. Il fournit des fonctions logicielles (traçabilité, rôles,
          journal) qui peuvent s&apos;inscrire dans une démarche de validation ; la
          validation elle-même est un travail d&apos;équipe, documenté, qui dépasse
          l&apos;outil.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">Pour qui</h2>
        <p>
          Le Data Manager doit pouvoir répondre en quelques secondes : quelles
          queries sont ouvertes, quelles données manquent, quels contrôles restent
          à faire. L&apos;ARC doit voir ses centres, les visites prévues, les centres en
          difficulté et les actions en retard. Le chef de projet voit le
          portefeuille, les jalons et les problèmes critiques.
        </p>
        <p>
          <Link href="/fonctionnement" className="text-accent">
            Comment l&apos;outil est organisé
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
      </div>
    </article>
  );
}
