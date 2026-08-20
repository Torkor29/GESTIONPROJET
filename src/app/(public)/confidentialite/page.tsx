import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confidentialité — Vigie",
  description:
    "Politique de confidentialité de Vigie : données de compte, absence de données nominatives de participants, hébergement local, durées de conservation configurables. Démarche RGPD, sans déclaration de conformité juridique.",
  alternates: { canonical: "/confidentialite" },
};

export default function PageConfidentialite() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Juridique</p>
      <h1 className="mt-3 font-titre text-4xl font-bold">Confidentialité et données</h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Vigie est conçu pour éviter les données directement identifiantes des
          participants : on suit un Subject ID, un centre, un statut, des visites
          et des queries. Les noms, dates de naissance et identifiants nationaux
          n&apos;ont pas vocation à y entrer.
        </p>
        <p>
          Les comptes utilisateurs (nom, adresse électronique, rôle, traces de
          connexion) sont des données personnelles. Ils sont hébergés sur le
          serveur de l&apos;établissement qui installe l&apos;outil. L&apos;éditeur du logiciel
          n&apos;opère pas un service cloud centralisé.
        </p>
        <p>
          Un journal d&apos;audit conserve qui a modifié quoi. Une politique de
          conservation peut être définie par l&apos;établissement. La suppression ou
          l&apos;anonymisation, lorsqu&apos;elle est juridiquement applicable, reste de la
          responsabilité du responsable de traitement.
        </p>
        <p>
          Cette page décrit l&apos;architecture. Elle ne constitue pas une analyse
          d&apos;impact, un registre des traitements, ni une attestation de conformité
          RGPD.
        </p>
        <p>
          <Link href="/donnees" className="text-accent">
            Données et sécurité
          </Link>
          {" · "}
          <Link href="/mentions-legales" className="text-accent">
            Mentions légales
          </Link>
        </p>
      </div>
    </article>
  );
}
