import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Méthodologie de suivi d'une étude clinique — Vigie",
  description:
    "Méthode de travail proposée par Vigie : étude, centres, sujets (Subject ID), visites, données, queries, monitoring, documents, tâches, jalons. Outil de clinical operations, pas une méthode réglementaire certifiée.",
  alternates: { canonical: "/methodologie" },
};

export default function PageMethodologie() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Produit</p>
      <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
        Une méthode de suivi, pas une doctrine
      </h1>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-attenue">
        <p>
          Vigie impose un fil, volontairement simple, parce que c&apos;est celui
          des unités : une étude, des centres, des sujets identifiés par un
          code, des visites protocolaires, des données à revoir, des queries, du
          monitoring, des documents, des tâches, des jalons. Chaque objet pointe
          vers les autres. Une query n&apos;existe pas « dans le vide » : elle a
          une étude, un centre, un Subject ID, parfois une visite et une
          variable.
        </p>
        <p>
          Cette méthode n&apos;est pas ICH E6(R3). Elle n&apos;est pas une SOP.
          Elle n&apos;interdit pas d&apos;avoir un eCRF, un LIMS, un outil de PV,
          CTIS. Elle évite que le suivi interne tienne dans trois tableurs et une
          boîte mail. Si votre établissement a déjà une méthode écrite, alignez
          les libellés ; ne dupliquez pas les vérités.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">Le fil</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="text-encre">Étude</strong> — cadre réglementaire,
            identifiants administratifs, équipe invitée. Guide :{" "}
            <Link href="/guides/demarrer-etude" className="text-accent hover:underline">
              démarrer une étude
            </Link>
            .
          </li>
          <li>
            <strong className="text-encre">Centres</strong> — statut, investigateur,
            documents, initiation. Guide :{" "}
            <Link href="/guides/ouvrir-centre" className="text-accent hover:underline">
              ouvrir un centre
            </Link>
            .
          </li>
          <li>
            <strong className="text-encre">Sujets</strong> — Subject ID seulement.{" "}
            <Link href="/guides/inclure-sujet" className="text-accent hover:underline">
              Suivre un sujet
            </Link>
            .
          </li>
          <li>
            <strong className="text-encre">Visites protocolaires</strong> — modèle
            au niveau étude, instances au niveau sujet.
          </li>
          <li>
            <strong className="text-encre">Queries et revue</strong> — cycle à cinq
            états.{" "}
            <Link href="/guides/queries" className="text-accent hover:underline">
              Ouvrir et fermer une query
            </Link>
            .
          </li>
          <li>
            <strong className="text-encre">Monitoring</strong> — visites ARC
            distinctes.{" "}
            <Link href="/guides/visites-monitoring" className="text-accent hover:underline">
              Planifier une visite
            </Link>
            .
          </li>
          <li>
            <strong className="text-encre">Écarts et CAPA</strong> —{" "}
            <Link href="/guides/ecarts-capa" className="text-accent hover:underline">
              enregistrer un écart
            </Link>
            .
          </li>
          <li>
            <strong className="text-encre">TMF et jalons</strong> —{" "}
            <Link href="/guides/tmf-documents" className="text-accent hover:underline">
              classer un document
            </Link>
            .
          </li>
        </ol>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          Indicateurs
        </h2>
        <p>
          On ne pilote pas une unité au feeling uniquement. On compte les queries
          ouvertes, les visites en retard, les documents expirants, le temps
          saisi, les écarts non clos. On ne fabrique pas un « score de
          conformité » marketing. Un chiffre sort d&apos;un filtre honnête, ou on
          ne l&apos;affiche pas.
        </p>
        <h2 className="pt-4 font-titre text-2xl font-bold text-encre">
          États vides
        </h2>
        <p>
          Une étude sans patient n&apos;est pas une erreur. L&apos;écran dit quoi
          faire ensuite. Cette pédagogie évite le réflexe « l&apos;outil est
          cassé » — le même réflexe qu&apos;un filtre web face à une page trop
          pauvre. Le logiciel, comme le site public, doit montrer du contenu
          utile dès la première visite.
        </p>
        <p>
          Vue d&apos;ensemble :{" "}
          <Link href="/fonctionnement" className="text-accent hover:underline">
            Fonctionnement
          </Link>
          . Limites du produit :{" "}
          <Link href="/comparatif" className="text-accent hover:underline">
            ce que Vigie est et n&apos;est pas
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
