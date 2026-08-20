import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal des versions — Vigie",
  description:
    "Historique des versions de Vigie, logiciel de gestion de projet en recherche clinique. Évolutions fonctionnelles, sans prétendre à une validation réglementaire du logiciel.",
  alternates: { canonical: "/changelog" },
};

export default function PageChangelog() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Produit</p>
      <h1 className="mt-3 font-titre text-4xl font-bold">Journal des versions</h1>
      <p className="mt-4 text-attenue">
        Ce journal documente les changements de l&apos;application. Il ne constitue
        pas à lui seul un dossier de validation logicielle (CSV, IQ/OQ/PQ).
      </p>
      <section className="mt-10 space-y-3">
        <h2 className="font-titre text-2xl font-bold">2.0 — Clinical Operations</h2>
        <p className="text-sm text-efface">Août 2026</p>
        <ul className="list-disc space-y-2 pl-5 text-attenue">
          <li>Modules centres, sujets (Subject ID), visites protocolaires, CRF, queries, coding, safety.</li>
          <li>RBAC serveur : super admin, chef de projet, data manager, ARC, investigateur, lecture seule.</li>
          <li>Journal d&apos;audit, notifications, recherche globale (Ctrl+K).</li>
          <li>Jeu de démonstration réinitialisable.</li>
          <li>États vides pédagogiques : une étude sans donnée n&apos;est plus un écran bloqué.</li>
          <li>Pages publiques enrichies pour que les filtres d&apos;entreprise puissent classer le site.</li>
        </ul>
      </section>
      <section className="mt-10 space-y-3">
        <h2 className="font-titre text-2xl font-bold">1.x — Vigie projet</h2>
        <ul className="list-disc space-y-2 pl-5 text-attenue">
          <li>Études, missions, documents TMF, checklists réglementaires, monitorage, CAPA, budget, temps.</li>
          <li>Comptes individuels, invitations, partage d&apos;études.</li>
        </ul>
      </section>
    </article>
  );
}
