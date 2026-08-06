import Link from "next/link";
import { redirect } from "next/navigation";
import { utilisateurActuel } from "@/lib/auth";
import { formaterDuree } from "@/lib/format";
import { LIBELLES_STATUT_ETUDE } from "@/lib/format";
import {
  chargeEquipe,
  equipeParEtude,
  monitorageParEtude,
  synthesesParEtude,
} from "@/lib/requetes";
import { BarresHorizontales, Cadre, RienAMontrer } from "@/components/graphiques";
import { Icone } from "@/components/icones";
import MenuExport from "@/components/menu-export";

export const dynamic = "force-dynamic";

/** Un compteur de la colonne « en cours » : discret à zéro, visible sinon. */
function Compteur({
  valeur,
  enRetard = 0,
  href,
  titre,
}: {
  valeur: number;
  enRetard?: number;
  href: string;
  titre: string;
}) {
  if (valeur === 0) return <span className="text-efface">—</span>;

  return (
    <Link
      href={href}
      title={titre}
      className="chiffres inline-flex items-baseline gap-1 transition-opacity hover:opacity-70"
    >
      <span className="font-medium">{valeur}</span>
      {enRetard > 0 && <span className="text-xs font-semibold text-alerte">({enRetard} ⚠)</span>}
    </Link>
  );
}

export default async function PagePortefeuille() {
  const compte = await utilisateurActuel();
  if (!compte) redirect("/connexion");

  const [syntheses, monitorage, charge, equipes] = await Promise.all([
    synthesesParEtude(),
    monitorageParEtude(),
    chargeEquipe(),
    equipeParEtude(),
  ]);

  const actives = syntheses.filter((s) => s.statut !== "archivee");
  const minutesTotales = charge.reduce((t, p) => t + p.minutes, 0);

  // Ce qui demande une décision : retards de mission, écarts critiques,
  // actions dépassées. C'est la première chose qu'un chef de projet regarde.
  const aTraiter = actives.reduce(
    (acc, s) => {
      const m = monitorage.get(s.id);
      return {
        missions: acc.missions + s.missionsEnRetard,
        visites: acc.visites + (m?.visitesEnRetard ?? 0),
        critiques: acc.critiques + (m?.ecartsCritiques ?? 0),
        actions: acc.actions + (m?.actionsEnRetard ?? 0),
      };
    },
    { missions: 0, visites: 0, critiques: 0, actions: 0 },
  );

  const total = aTraiter.missions + aTraiter.visites + aTraiter.critiques + aTraiter.actions;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="sur-titre">Management</p>
          <h1 className="mt-1.5 font-titre text-3xl font-bold">Portefeuille</h1>
          <p className="mt-2 max-w-2xl text-attenue">
            L&apos;état de chaque étude en une ligne, et la charge de chacun sur
            les études que vous portez.
          </p>
        </div>
        <MenuExport base="/api/export-etudes" />
      </header>

      {/* ---------------------------------------------------- Ce qui presse */}
      <section
        className={`carte p-5 ${total > 0 ? "border-alerte/30 bg-alerte-voile/20" : ""}`}
      >
        <h2 className="font-titre text-lg font-bold">
          {total > 0 ? "Ce qui demande une décision" : "Rien ne presse"}
        </h2>
        {total === 0 ? (
          <p className="mt-1 text-sm text-attenue">
            Aucun retard ni écart critique sur vos études actives.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {[
              { n: aTraiter.critiques, l: "écart critique ouvert", ls: "écarts critiques ouverts", h: "/ecarts?gravite=critique" },
              { n: aTraiter.actions, l: "action corrective en retard", ls: "actions correctives en retard", h: "/actions" },
              { n: aTraiter.missions, l: "mission en retard", ls: "missions en retard", h: "/missions?masquerTerminees=1" },
              { n: aTraiter.visites, l: "visite en retard", ls: "visites en retard", h: "/visites" },
            ]
              .filter((x) => x.n > 0)
              .map((x) => (
                <li key={x.l}>
                  <Link href={x.h} className="transition-opacity hover:opacity-70">
                    <strong className="chiffres font-semibold text-alerte">{x.n}</strong>{" "}
                    {x.n > 1 ? x.ls : x.l}
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* -------------------------------------------------- Tableau du portefeuille */}
      <section className="carte relative overflow-x-auto">
        <div className="flex items-center justify-between gap-3 border-b border-ligne px-5 py-4">
          <h2 className="font-titre text-lg font-bold">Vos études</h2>
          <Link
            href="/etudes"
            className="sans-impression text-sm font-medium text-accent transition-opacity hover:opacity-70"
          >
            Gérer les études
          </Link>
        </div>

        {syntheses.length === 0 ? (
          <RienAMontrer message="Aucune étude pour l'instant." />
        ) : (
          <table className="w-full min-w-[58rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ligne bg-creux/50 text-left">
                <th scope="col" className="sur-titre px-5 py-3">Étude</th>
                <th scope="col" className="sur-titre w-24 px-3 py-3">Statut</th>
                <th scope="col" className="sur-titre w-24 px-3 py-3">Missions</th>
                <th scope="col" className="sur-titre w-24 px-3 py-3">Visites</th>
                <th scope="col" className="sur-titre w-24 px-3 py-3">Écarts</th>
                <th scope="col" className="sur-titre w-24 px-3 py-3">Actions</th>
                <th scope="col" className="sur-titre w-28 px-3 py-3">Conformité</th>
                <th scope="col" className="sur-titre w-24 px-3 py-3">Temps</th>
                <th scope="col" className="sur-titre w-32 px-3 py-3">Équipe</th>
              </tr>
            </thead>
            <tbody>
              {syntheses.map((s) => {
                const m = monitorage.get(s.id);
                const invites = equipes.get(s.id) ?? [];

                return (
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

                    <td className="px-3 py-3 text-xs text-attenue">
                      {LIBELLES_STATUT_ETUDE[s.statut] ?? s.statut}
                    </td>

                    <td className="px-3 py-3">
                      <Compteur
                        valeur={s.missionsOuvertes}
                        enRetard={s.missionsEnRetard}
                        href={`/missions?etude=${s.id}&masquerTerminees=1`}
                        titre="Missions ouvertes"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <Compteur
                        valeur={m?.visitesOuvertes ?? 0}
                        enRetard={m?.visitesEnRetard ?? 0}
                        href={`/visites?etude=${s.id}`}
                        titre="Visites en cours"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <Compteur
                        valeur={m?.ecartsOuverts ?? 0}
                        enRetard={m?.ecartsCritiques ?? 0}
                        href={`/ecarts?etude=${s.id}`}
                        titre="Écarts ouverts, dont critiques"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <Compteur
                        valeur={m?.actionsOuvertes ?? 0}
                        enRetard={m?.actionsEnRetard ?? 0}
                        href={`/actions?etude=${s.id}`}
                        titre="Actions à traiter"
                      />
                    </td>

                    <td className="chiffres px-3 py-3">
                      {s.conformite === null ? (
                        <span className="text-efface">—</span>
                      ) : (
                        `${s.conformite} %`
                      )}
                    </td>

                    <td className="chiffres px-3 py-3">
                      {s.minutes > 0 ? (
                        formaterDuree(s.minutes)
                      ) : (
                        <span className="text-efface">—</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-xs text-attenue">
                      {invites.length > 0 ? (
                        <span title={invites.map((i) => `${i.nom} (${i.niveau})`).join(", ")}>
                          {invites.length} convié{invites.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-efface">vous seul</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* ------------------------------------------------------ Charge d'équipe */}
      <Cadre
        titre="Charge par personne"
        detail="Sur les études que vous portez — des totaux, jamais le détail des saisies"
      >
        {charge.length === 0 ? (
          <RienAMontrer message="Aucun temps saisi sur vos études. La charge apparaîtra dès qu'il y en aura." />
        ) : (
          <>
            <BarresHorizontales
              lignes={charge.map((p) => ({
                cle: String(p.utilisateurId),
                libelle: p.nom,
                valeur: p.minutes,
                affichage: `${formaterDuree(p.minutes)} · ${Math.round((p.minutes / Math.max(1, minutesTotales)) * 100)} %`,
              }))}
            />

            <ul className="mt-6 space-y-4 border-t border-ligne pt-5">
              {charge.map((p) => (
                <li key={p.utilisateurId}>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-voile font-titre text-[10px] font-bold text-accent-appuye"
                    >
                      {p.nom
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((x) => x[0]?.toUpperCase() ?? "")
                        .join("")}
                    </span>
                    {p.nom}
                  </p>
                  <ul className="ml-9 flex flex-wrap gap-x-4 gap-y-1 text-xs text-attenue">
                    {p.parEtude.map((e) => (
                      <li key={e.etudeId} className="flex items-center gap-1.5">
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: e.couleur }}
                        />
                        {e.nom} · <span className="chiffres">{formaterDuree(e.minutes)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </>
        )}
      </Cadre>

      <p className="flex items-start gap-2.5 text-sm text-attenue">
        <Icone nom="bouclier" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        La charge n&apos;est visible que sur les études dont vous êtes
        propriétaire. Être convié sur l&apos;étude de quelqu&apos;un ne donne pas
        à voir le temps des autres.
      </p>
    </div>
  );
}
