import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confidentialité — Vigie",
  description:
    "Politique de confidentialité de Vigie : données de compte, absence de données nominatives de participants, hébergement local, cookie de session, journal d'audit, durées de conservation. Démarche RGPD, sans déclaration de conformité juridique.",
  alternates: { canonical: "/confidentialite" },
};

export default function PageConfidentialite() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Juridique</p>
      <h1 className="mt-3 font-titre text-4xl font-bold">Confidentialité et données</h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Cette page décrit l&apos;architecture de Vigie du point de vue des
          données. Elle ne constitue pas une analyse d&apos;impact, un registre
          des traitements, ni une attestation de conformité RGPD. Le responsable
          de traitement — pour les comptes de l&apos;instance, l&apos;établissement
          hébergeur ; pour l&apos;essai, généralement le promoteur — reste
          décisionnaire.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">
          Participants à la recherche
        </h2>
        <p>
          Vigie est conçu pour éviter les données directement identifiantes des
          participants : on suit un Subject ID, un centre, un statut, des visites
          et des queries. Les noms, dates de naissance et identifiants nationaux
          n&apos;ont pas vocation à y entrer. Un numéro d&apos;inclusion associé
          à une table de correspondance au centre est une donnée pseudonymisée,
          pas une donnée anonyme. Voir l&apos;article{" "}
          <Link
            href="/actualites/subject-id-et-rgpd"
            className="text-accent hover:underline"
          >
            Subject ID et RGPD
          </Link>
          .
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Comptes</h2>
        <p>
          Les comptes utilisateurs (nom, adresse électronique, rôle, traces de
          connexion) sont des données personnelles. Ils sont hébergés sur le
          serveur de l&apos;établissement qui installe l&apos;outil. L&apos;éditeur
          du logiciel n&apos;opère pas un service cloud centralisé. Un journal
          d&apos;audit conserve qui a modifié quoi. Une politique de conservation
          peut être définie par l&apos;établissement. La suppression ou
          l&apos;anonymisation, lorsqu&apos;elle est juridiquement applicable,
          reste de la responsabilité du responsable de traitement.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Cookies</h2>
        <p>
          Le fonctionnement de l&apos;application ne repose sur aucun traceur
          publicitaire ni outil de mesure d&apos;audience tiers. Le seul témoin
          de connexion déposé est celui qui maintient la session ouverte après
          authentification ; il est strictement nécessaire au service et disparaît
          à la déconnexion. Les pages publiques se lisent sans cookie.
        </p>
        <h2 className="font-titre text-2xl font-bold text-encre">Pages publiques</h2>
        <p>
          Le site d&apos;information (guides, glossaire, articles, référentiels)
          ne collecte pas de formulaire de contact automatique. Il n&apos;y a
          pas de compte grand public. L&apos;objet de ces pages est
          d&apos;expliquer l&apos;outil et de permettre à un filtre d&apos;entreprise
          de classer le domaine comme un site professionnel.
        </p>
        <p>
          <Link href="/donnees" className="text-accent hover:underline">
            Données et sécurité
          </Link>
          {" · "}
          <Link href="/securite" className="text-accent hover:underline">
            Sécurité
          </Link>
          {" · "}
          <Link href="/hebergement" className="text-accent hover:underline">
            Hébergement
          </Link>
          {" · "}
          <Link href="/mentions-legales" className="text-accent hover:underline">
            Mentions légales
          </Link>
          {" · "}
          <Link href="/cgu" className="text-accent hover:underline">
            Conditions d&apos;utilisation
          </Link>
        </p>
      </div>
    </article>
  );
}
