import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossaire de la recherche clinique — Vigie",
  description:
    "Glossaire opérationnel : query, CRF, monitoring, déviation, CAPA, TMF, Subject ID, database lock, SAE. Destiné aux équipes de recherche clinique qui utilisent un outil de gestion de projet.",
  alternates: { canonical: "/glossaire" },
};

const termes: { mot: string; def: string }[] = [
  {
    mot: "Query",
    def: "Demande de clarification sur une donnée. Cycle usuel : ouverte, répondue, rouverte, résolue, fermée. Vigie historise chaque transition.",
  },
  {
    mot: "CRF / eCRF",
    def: "Cahier d'observation. Dans Vigie, on décrit la structure (formulaires, variables, contraintes) pour rattacher les queries ; ce n'est pas l'EDC du promoteur.",
  },
  {
    mot: "Subject ID",
    def: "Identifiant d'un participant dans l'étude. Vigie n'enregistre pas le nom, la date de naissance ni un identifiant national.",
  },
  {
    mot: "Monitoring (visite ARC)",
    def: "Visite de mise en place, de routine, de clôture ou à distance. Distincte des visites protocolaires du sujet.",
  },
  {
    mot: "Déviation au protocole",
    def: "Écart entre ce qui était prévu et ce qui a été fait. Gravité, impact, actions correctives et préventives.",
  },
  {
    mot: "CAPA",
    def: "Action corrective ou préventive. Une action faite n'est close qu'après vérification de son efficacité.",
  },
  {
    mot: "TMF",
    def: "Trial Master File : documents essentiels de l'essai, versionnés, datés, parfois soumis à expiration.",
  },
  {
    mot: "Database lock",
    def: "Gel de la base avant analyse. Jalon de data management, pas un bouton magique de conformité.",
  },
  {
    mot: "SAE / SUSAR",
    def: "Événement indésirable grave / suspicion d'effet inattendu grave. Vigie permet un suivi de projet, pas la déclaration réglementaire.",
  },
  {
    mot: "DMP",
    def: "Data Management Plan : version, date, responsable, statut de validation. Document de conduite, pas un avis réglementaire.",
  },
];

export default function PageGlossaire() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <p className="sur-titre">Référence</p>
      <h1 className="mt-3 font-titre text-4xl font-bold">Glossaire opérationnel</h1>
      <p className="mt-4 text-lg text-attenue">
        Vocabulaire utilisé dans Vigie, aligné sur le quotidien des équipes de
        recherche clinique hospitalière. Ces définitions sont opérationnelles :
        elles ne remplacent pas un texte réglementaire.
      </p>
      <dl className="mt-10 space-y-8">
        {termes.map((t) => (
          <div key={t.mot}>
            <dt className="font-titre text-xl font-bold">{t.mot}</dt>
            <dd className="mt-2 leading-relaxed text-attenue">{t.def}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
