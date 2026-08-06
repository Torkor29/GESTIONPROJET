import Link from "next/link";
import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import { formaterDuree } from "@/lib/format";
import { REFERENTIELS_PAR_CLE } from "@/lib/referentiels";
import {
  fluxMissionsParMois,
  progressionParReferentiel,
  respectDesEcheances,
  statistiques,
  synthesesParEtude,
  tempsParSemaine,
} from "@/lib/requetes";
import { Icone, type NomIcone } from "@/components/icones";
import {
  BarresGroupees,
  BarresHorizontales,
  BarresTemps,
  Cadre,
  RienAMontrer,
} from "@/components/graphiques";
import MenuExport from "@/components/menu-export";

export const dynamic = "force-dynamic";

function Chiffre({
  libelle,
  valeur,
  detail,
  icone,
  alerte,
}: {
  libelle: string;
  valeur: string;
  detail?: string;
  icone: NomIcone;
  alerte?: boolean;
}) {
  return (
    <div className="carte p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="sur-titre">{libelle}</p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            alerte ? "bg-alerte-voile text-alerte" : "bg-accent-voile text-accent-appuye"
          }`}
        >
          <Icone nom={icone} className="h-4 w-4" />
        </span>
      </div>
      <p className={`chiffres mt-2 font-titre text-3xl font-bold ${alerte ? "text-alerte" : ""}`}>
        {valeur}
      </p>
      {detail && <p className="mt-0.5 text-xs text-attenue">{detail}</p>}
    </div>
  );
}

const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export default async function PageIndicateurs() {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const [stats, semaines, flux, refs, syntheses, echeances] = await Promise.all([
    statistiques(),
    tempsParSemaine(12),
    fluxMissionsParMois(6),
    progressionParReferentiel(),
    synthesesParEtude(),
    respectDesEcheances(),
  ]);

  const actives = syntheses.filter((s) => s.statut !== "archivee");
  const minutesTotales = syntheses.reduce((t, s) => t + s.minutes, 0);

  const avecConformite = syntheses.filter((s) => s.conformite !== null);
  const conformiteMoyenne =
    avecConformite.length > 0
      ? Math.round(
          avecConformite.reduce((t, s) => t + (s.conformite ?? 0), 0) / avecConformite.length,
        )
      : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="sur-titre">Indicateurs</p>
          <h1 className="mt-1.5 font-titre text-3xl font-bold">Vue d&apos;ensemble</h1>
          <p className="mt-2 max-w-2xl text-attenue">
            Des chiffres présentables en réunion, calculés sur ce à quoi vous avez
            accès — vos études et celles auxquelles vous êtes convié.
          </p>
        </div>
        <MenuExport base="/api/export-etudes" />
      </header>

      {/* ------------------------------------------------------- Chiffres clés */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Chiffre
          libelle="Missions ouvertes"
          valeur={String(stats.tachesOuvertes)}
          detail={
            stats.tachesEnRetard > 0 ? `dont ${stats.tachesEnRetard} en retard` : "aucun retard"
          }
          alerte={stats.tachesEnRetard > 0}
          icone="drapeau"
        />
        <Chiffre
          libelle="Échéances tenues"
          valeur={echeances.pourcentage === null ? "—" : `${echeances.pourcentage} %`}
          detail={
            echeances.pourcentage === null
              ? "aucune mission datée terminée"
              : `${echeances.aLHeure} à l'heure, ${echeances.enRetard} en retard`
          }
          icone="checklist"
        />
        <Chiffre
          libelle="Conformité moyenne"
          valeur={conformiteMoyenne === null ? "—" : `${conformiteMoyenne} %`}
          detail={
            conformiteMoyenne === null
              ? "aucune checklist active"
              : `sur ${avecConformite.length} étude${avecConformite.length > 1 ? "s" : ""}`
          }
          icone="bouclier"
        />
        <Chiffre
          libelle="Temps saisi"
          valeur={formaterDuree(minutesTotales)}
          detail={`${actives.length} étude${actives.length > 1 ? "s" : ""} suivie${actives.length > 1 ? "s" : ""}`}
          icone="chrono"
        />
      </div>

      {/* ----------------------------------------------------------- Tendances */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Cadre titre="Temps saisi par semaine" detail="Sur les douze dernières semaines">
          {semaines.every((s) => s.valeur === 0) ? (
            <RienAMontrer message="Aucun temps saisi sur la période." />
          ) : (
            <BarresTemps
              formater={formaterDuree}
              points={semaines.map((s) => {
                const d = new Date(s.debut * 1000);
                return {
                  etiquette: `${d.getDate()}/${d.getMonth() + 1}`,
                  valeur: s.valeur,
                  infobulle: `Semaine du ${d.toLocaleDateString("fr-FR")} — ${formaterDuree(s.valeur)}`,
                };
              })}
            />
          )}
        </Cadre>

        <Cadre
          titre="Missions créées et terminées"
          detail="Mois par mois — une barre « terminées » plus haute signifie qu'on rattrape"
        >
          {flux.every((f) => f.creees === 0 && f.terminees === 0) ? (
            <RienAMontrer message="Aucune mission sur la période." />
          ) : (
            <BarresGroupees
              libelleA="Créées"
              libelleB="Terminées"
              points={flux.map((f) => {
                const d = new Date(f.debut * 1000);
                return {
                  etiquette: MOIS_COURTS[d.getMonth()],
                  a: f.creees,
                  b: f.terminees,
                };
              })}
            />
          )}
        </Cadre>
      </div>

      {/* ------------------------------------------------------- Réglementaire */}
      <Cadre
        titre="Avancement par référentiel"
        detail="Toutes études confondues, hors lignes marquées « sans objet »"
      >
        {refs.size === 0 ? (
          <RienAMontrer message="Aucune checklist réglementaire active. Cochez un cadre sur une étude pour la générer." />
        ) : (
          <BarresHorizontales
            lignes={[...refs.entries()]
              .sort(([, a], [, b]) => b.pourcentage - a.pourcentage)
              .map(([cle, p]) => ({
                cle,
                libelle: REFERENTIELS_PAR_CLE.get(cle)?.nom ?? cle,
                valeur: p.pourcentage,
                affichage: `${p.pourcentage} % · ${p.faits}/${p.total}`,
              }))}
          />
        )}
      </Cadre>

      {/* -------------------------------------------------- Tableau par étude */}
      <section className="carte relative overflow-x-auto">
        <div className="flex items-center justify-between gap-3 border-b border-ligne px-5 py-4">
          <h2 className="font-titre text-lg font-bold">Par étude</h2>
          <Link
            href="/etudes"
            className="sans-impression text-sm font-medium text-accent transition-opacity hover:opacity-70"
          >
            Voir les études
          </Link>
        </div>

        {syntheses.length === 0 ? (
          <RienAMontrer message="Aucune étude pour l'instant." />
        ) : (
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ligne bg-creux/50 text-left">
                <th scope="col" className="sur-titre px-5 py-3">Étude</th>
                <th scope="col" className="sur-titre px-3 py-3">Missions</th>
                <th scope="col" className="sur-titre px-3 py-3">En retard</th>
                <th scope="col" className="sur-titre px-3 py-3">Conformité</th>
                <th scope="col" className="sur-titre px-3 py-3">Temps</th>
                <th scope="col" className="sur-titre px-3 py-3">Documents</th>
              </tr>
            </thead>
            <tbody>
              {syntheses.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-ligne transition-colors duration-150 last:border-0 hover:bg-creux/60"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/etudes/${s.id}`}
                      className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-70"
                    >
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-inset ring-black/5"
                        style={{ backgroundColor: s.couleur }}
                      />
                      <span className="truncate font-medium">{s.code ?? s.nom}</span>
                    </Link>
                  </td>
                  <td className="chiffres px-3 py-3">{s.missionsOuvertes}</td>
                  <td className="chiffres px-3 py-3">
                    {s.missionsEnRetard > 0 ? (
                      <span className="font-semibold text-alerte">{s.missionsEnRetard}</span>
                    ) : (
                      <span className="text-efface">—</span>
                    )}
                  </td>
                  <td className="chiffres px-3 py-3">
                    {s.conformite === null ? (
                      <span className="text-efface">—</span>
                    ) : (
                      `${s.conformite} %`
                    )}
                  </td>
                  <td className="chiffres px-3 py-3">
                    {s.minutes > 0 ? formaterDuree(s.minutes) : <span className="text-efface">—</span>}
                  </td>
                  <td className="chiffres px-3 py-3">
                    {s.documents > 0 ? s.documents : <span className="text-efface">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ------------------------------------------------------ Charge par étude */}
      <Cadre titre="Répartition du temps" detail="Chaque étude garde sa propre couleur">
        {minutesTotales === 0 ? (
          <RienAMontrer message="Aucun temps saisi." />
        ) : (
          <BarresHorizontales
            lignes={syntheses
              .filter((s) => s.minutes > 0)
              .sort((a, b) => b.minutes - a.minutes)
              .map((s) => ({
                cle: String(s.id),
                libelle: s.nom,
                valeur: s.minutes,
                couleur: s.couleur,
                affichage: `${formaterDuree(s.minutes)} · ${Math.round((s.minutes / minutesTotales) * 100)} %`,
              }))}
          />
        )}
      </Cadre>
    </div>
  );
}
