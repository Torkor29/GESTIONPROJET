import type { Metadata } from "next";
import Link from "next/link";
import { Icone } from "@/components/icones";
import {
  AVERTISSEMENT,
  LIBELLES_PHASE,
  ORDRE_PHASES,
  REFERENTIELS,
  type Phase,
} from "@/lib/referentiels";

export const metadata: Metadata = {
  title: "Référentiels réglementaires couverts — Vigie",
  description:
    "Les cadres réglementaires pris en charge par Vigie pour la recherche clinique : RIPH catégories 1, 2 et 3, règlement UE 536/2014 sur les essais cliniques de médicaments, règlements MDR 2017/745 et IVDR 2017/746, ICH E6(R3), méthodologies de référence de la CNIL et archivage des données de recherche.",
  alternates: { canonical: "/reglementaire" },
};

function compterParPhase(items: { phase: Phase }[]) {
  return ORDRE_PHASES.map((p) => ({
    phase: p,
    nombre: items.filter((i) => i.phase === p).length,
  })).filter((l) => l.nombre > 0);
}

export default function PageReglementaire() {
  const parType = REFERENTIELS.filter((r) => r.categorie === "type");
  const transversaux = REFERENTIELS.filter((r) => r.categorie === "transversal");
  const total = REFERENTIELS.reduce((t, r) => t + r.items.length, 0);

  const groupes = [
    {
      titre: "Selon le type de recherche",
      texte:
        "On en retient en principe un seul : il dépend de la nature de l'intervention et du produit étudié. C'est cette qualification qui détermine le circuit d'autorisation, les délais et les interlocuteurs.",
      liste: parType,
    },
    {
      titre: "Cadres transversaux",
      texte:
        "Ils se cumulent avec le précédent : quelle que soit la catégorie de la recherche, la protection des données, les bonnes pratiques cliniques et l'archivage s'appliquent.",
      liste: transversaux,
    },
  ];

  return (
    <div className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="sur-titre">Référentiels</p>
        <h1 className="mt-3 font-titre text-4xl font-bold leading-tight">
          Les obligations, déjà écrites
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-attenue">
          Vigie livre {REFERENTIELS.length} référentiels et {total} obligations
          rédigées. Dans une étude, vous cochez le cadre applicable et les lignes
          correspondantes apparaissent, regroupées par phase du projet. Chacune
          porte sa référence réglementaire, se coche, s&apos;annote, ou se marque
          « sans objet » — auquel cas elle sort du calcul de progression.
        </p>

        <div className="carte mt-8 border-attention/30 bg-attention-voile/40 p-5">
          <p className="flex items-start gap-3 text-sm leading-relaxed">
            <span className="mt-0.5 shrink-0 text-attention">
              <Icone nom="bouclier" className="h-5 w-5" />
            </span>
            <span>
              <strong className="font-semibold">{AVERTISSEMENT}</strong> Chaque
              référentiel affiche la date à laquelle son contenu a été vérifié et
              les sources officielles correspondantes.
            </span>
          </p>
        </div>

        {groupes.map((g) => (
          <section key={g.titre} className="mt-14">
            <h2 className="font-titre text-2xl font-bold">{g.titre}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-attenue">{g.texte}</p>

            <div className="mt-6 space-y-3">
              {g.liste.map((r) => (
                <Link
                  key={r.cle}
                  href={`/reglementaire/${r.cle}`}
                  className="carte carte-active group block p-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-titre text-lg font-bold">{r.nom}</h3>
                    <span className="chiffres text-xs text-efface">
                      {r.items.length} obligations
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-attenue">{r.resume}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {compterParPhase(r.items).map((l) => (
                      <span key={l.phase} className="etiquette bg-relief text-attenue">
                        {LIBELLES_PHASE[l.phase]} · {l.nombre}
                      </span>
                    ))}
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    Voir le détail
                    <Icone
                      nom="fleche"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-14">
          <h2 className="font-titre text-2xl font-bold">Les cinq phases</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-attenue">
            Quel que soit le référentiel, les obligations sont rangées dans le
            même ordre — celui du projet, pas celui du texte de loi. Une étude
            avance de la conception à l&apos;archivage, et la checklist suit ce
            mouvement.
          </p>

          <ol className="mt-6 space-y-3">
            {ORDRE_PHASES.map((p, i) => (
              <li key={p} className="carte flex items-start gap-4 p-5">
                <span className="chiffres flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-voile font-semibold text-accent-appuye">
                  {i + 1}
                </span>
                <div>
                  <p className="font-titre font-bold">{LIBELLES_PHASE[p]}</p>
                  <p className="mt-1 text-sm leading-relaxed text-attenue">
                    {
                      {
                        conception:
                          "Qualifier la recherche, écrire le protocole, monter le budget et la convention, identifier les centres.",
                        soumission:
                          "Constituer le dossier, le déposer auprès des autorités compétentes, répondre aux demandes de compléments.",
                        mise_en_place:
                          "Réunion de mise en place, formation des équipes, ouverture des centres, réception des matériels.",
                        conduite:
                          "Inclusions, monitorage, gestion des écarts et des événements, amendements, suivi de la qualité des données.",
                        cloture:
                          "Dernière visite, gel de la base, rapport final, information des autorités, archivage pour la durée réglementaire.",
                      }[p]
                    }
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-14 text-sm text-attenue">
          Les référentiels sont modifiables : ils vivent dans un seul fichier du
          code source, et un bouton « Actualiser depuis le référentiel » reporte
          les changements sur une étude déjà en cours sans effacer le travail
          fait.{" "}
          <Link href="/donnees" className="text-accent hover:underline">
            Voir aussi la page Données et sécurité
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
