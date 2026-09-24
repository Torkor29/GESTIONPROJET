import Link from "next/link";
import { demarrerChrono } from "@/actions/temps";
import type { EtudeChoisissable } from "./choix-etudes";
import { AvancementMission } from "./etudes-mission";
import FormulaireTache from "./formulaire-tache";
import { Icone } from "./icones";
import NoteLigneMission from "./note-ligne-mission";
import SelecteurStatut, { SelecteurStatutLigne } from "./selecteur-statut";
import TableauMissions, { EtiquetteType, type LigneMission } from "./tableau-missions";
import { EtiquettePriorite } from "./etiquettes";
import { formaterDate } from "@/lib/format";
import { avancement, cleType, type LigneEtudeMission } from "@/lib/missions";

/* -------------------------------------------------------------------------- */
/*  Par étude                                                                 */
/* -------------------------------------------------------------------------- */

/** Ce qu'une mission demande à une étude : la mission, et sa ligne s'il y en a une. */
type Element = { mission: LigneMission; ligne?: LigneEtudeMission };

type GroupeEtude = {
  etudeId: number | null;
  nom: string;
  code: string | null;
  couleur: string;
  elements: Element[];
};

const statutDe = (e: Element) => e.ligne?.statut ?? e.mission.tache.statut;

/**
 * Éclate les missions étude par étude : une mission sur vingt études apparaît
 * sous chacune des vingt, avec le statut propre à chacune.
 */
function regrouperParEtude(missions: LigneMission[]): GroupeEtude[] {
  const groupes = new Map<number | null, GroupeEtude>();
  const groupe = (
    etudeId: number | null,
    infos: { nom: string; code: string | null; couleur: string },
  ) => {
    if (!groupes.has(etudeId)) groupes.set(etudeId, { etudeId, ...infos, elements: [] });
    return groupes.get(etudeId)!;
  };

  for (const m of missions) {
    const lignes = m.lignesEtudes ?? [];
    if (lignes.length > 0) {
      for (const l of lignes) {
        groupe(l.etudeId, { nom: l.etudeNom, code: l.etudeCode, couleur: l.etudeCouleur }).elements.push(
          { mission: m, ligne: l },
        );
      }
    } else if (m.tache.etudeId) {
      groupe(m.tache.etudeId, {
        nom: m.etudeNom ?? "Étude",
        code: m.etudeCode ?? null,
        couleur: m.etudeCouleur ?? "#a8a29e",
      }).elements.push({ mission: m });
    } else {
      groupe(null, { nom: "Sans étude", code: null, couleur: "#a8a29e" }).elements.push({
        mission: m,
      });
    }
  }

  // Ordre alphabétique des acronymes ; « Sans étude » ferme la marche.
  return [...groupes.values()].sort((a, b) => {
    if (a.etudeId === null) return 1;
    if (b.etudeId === null) return -1;
    return (a.code ?? a.nom).localeCompare(b.code ?? b.nom, "fr", { sensitivity: "base" });
  });
}

export function VueParEtude({
  missions,
  etudes,
  typesConnus,
  etudeId,
  statut,
  masquerTerminees = false,
  message = "Aucune mission.",
}: {
  missions: LigneMission[];
  etudes: EtudeChoisissable[];
  typesConnus?: string[];
  /** Ne montrer que cette étude. */
  etudeId?: number | null;
  /** Filtre sur le statut propre à chaque étude, pas sur celui de la mission. */
  statut?: string;
  masquerTerminees?: boolean;
  message?: string;
}) {
  const maintenant = Math.floor(Date.now() / 1000);

  const groupes = regrouperParEtude(missions)
    .filter((g) => !etudeId || g.etudeId === etudeId)
    .map((g) => ({
      ...g,
      elements: g.elements.filter((e) => {
        const s = statutDe(e);
        if (statut && s !== statut) return false;
        if (masquerTerminees && (s === "terminee" || s === "sans_objet")) return false;
        return true;
      }),
    }))
    .filter((g) => g.elements.length > 0);

  if (groupes.length === 0) {
    return <p className="carte p-10 text-center text-sm text-attenue">{message}</p>;
  }

  return (
    <div className="space-y-3">
      {groupes.map((g) => {
        const ouverts = g.elements.filter(
          (e) => statutDe(e) !== "terminee" && statutDe(e) !== "sans_objet",
        ).length;
        const enRetard = g.elements.filter(
          (e) =>
            statutDe(e) !== "terminee" &&
            statutDe(e) !== "sans_objet" &&
            e.mission.tache.echeance &&
            e.mission.tache.echeance < maintenant,
        ).length;

        return (
          <details key={g.etudeId ?? "sans"} open={ouverts > 0} className="carte group/etude">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
              <span
                aria-hidden
                className="text-xs text-attenue transition-transform group-open/etude:rotate-90"
              >
                ▸
              </span>
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-inset ring-black/5"
                style={{ backgroundColor: g.couleur }}
              />
              <span className="min-w-0 flex-1 truncate">
                {g.code && <span className="mr-2 font-titre font-bold">{g.code}</span>}
                <span className={g.code ? "text-sm text-attenue" : "font-titre font-bold"}>
                  {g.nom}
                </span>
              </span>
              <span className="chiffres text-xs text-attenue">
                {ouverts} ouverte{ouverts > 1 ? "s" : ""} / {g.elements.length}
                {enRetard > 0 && <span className="text-alerte"> · {enRetard} en retard</span>}
              </span>
              <AvancementMission lignes={g.elements.map((e) => ({ statut: statutDe(e) }))} />
              {g.etudeId && (
                <Link
                  href={`/etudes/${g.etudeId}?section=missions`}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Fiche
                </Link>
              )}
            </summary>

            <div className="relative overflow-x-auto border-t border-ligne">
              <table className="w-full min-w-[44rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ligne bg-creux/50 text-left">
                    <th scope="col" className="sur-titre px-4 py-2">
                      Mission
                    </th>
                    <th scope="col" className="sur-titre w-36 px-3 py-2">
                      Statut
                    </th>
                    <th scope="col" className="sur-titre w-28 px-3 py-2">
                      Échéance
                    </th>
                    <th scope="col" className="sur-titre px-3 py-2">
                      Commentaire
                    </th>
                    <th scope="col" className="w-20 px-3 py-2">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {g.elements.map((e) => (
                    <LigneParEtude
                      key={`${e.mission.tache.id}-${e.ligne?.id ?? "m"}`}
                      element={e}
                      etudeId={g.etudeId}
                      etudes={etudes}
                      typesConnus={typesConnus}
                      maintenant={maintenant}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function LigneParEtude({
  element: { mission, ligne },
  etudeId,
  etudes,
  typesConnus,
  maintenant,
}: {
  element: Element;
  etudeId: number | null;
  etudes: EtudeChoisissable[];
  typesConnus?: string[];
  maintenant: number;
}) {
  const { tache, modifiable = true, lignesEtudes = [] } = mission;
  const statut = ligne?.statut ?? tache.statut;
  const close = statut === "terminee" || statut === "sans_objet";
  const enRetard = !close && tache.echeance && tache.echeance < maintenant;
  const etiquette = ligne ? (ligne.etudeCode ?? ligne.etudeNom) : "";

  return (
    <tr className="group border-b border-ligne transition-colors duration-150 last:border-0 hover:bg-creux/60">
      <td className="px-4 py-2.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className={close ? "text-attenue line-through" : "font-medium"}>{tache.titre}</span>
          <EtiquettePriorite priorite={tache.priorite} />
          <EtiquetteType type={tache.type} />
          {ligne && lignesEtudes.length > 1 && (
            <span className="text-xs text-efface" title="Mission portée sur plusieurs études">
              · {lignesEtudes.length} études
            </span>
          )}
        </span>
      </td>
      <td className="px-3 py-2.5">
        {ligne ? (
          <SelecteurStatutLigne id={ligne.id} statut={ligne.statut} etude={etiquette} />
        ) : (
          <SelecteurStatut id={tache.id} statut={tache.statut} />
        )}
      </td>
      <td className="chiffres px-3 py-2.5">
        {tache.echeance ? (
          <span className={enRetard ? "font-semibold text-alerte" : "text-attenue"}>
            {enRetard && "⚠ "}
            {formaterDate(tache.echeance)}
          </span>
        ) : (
          <span className="text-efface">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-xs text-attenue">
        {ligne ? (
          <NoteLigneMission id={ligne.id} notes={ligne.notes} etude={etiquette} />
        ) : tache.notes ? (
          <span className="line-clamp-2">{tache.notes}</span>
        ) : (
          <span className="text-efface">—</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <span className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
          {!close && (
            <form action={demarrerChrono}>
              <input type="hidden" name="etudeId" value={etudeId ?? ""} />
              <input type="hidden" name="tacheId" value={tache.id} />
              <button
                type="submit"
                title="Démarrer le chronomètre sur cette mission"
                aria-label="Démarrer le chronomètre sur cette mission"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-attenue transition-all duration-200 hover:bg-relief hover:text-accent active:scale-95"
              >
                <Icone nom="chrono" className="h-4 w-4" />
              </button>
            </form>
          )}
          {modifiable && (
            <FormulaireTache
              tache={tache}
              etudesLiees={lignesEtudes.map((l) => l.etudeId)}
              etudes={etudes}
              typesConnus={typesConnus}
              libelle="✎"
              variante="icone"
            />
          )}
        </span>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/*  Par type                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Regroupe les missions par type — « Archivage : ces vingt études » — en
 * gardant, pour chaque mission, le détail étude par étude.
 */
export function VueParType({
  missions,
  etudes,
  typesConnus,
  message = "Aucune mission.",
}: {
  missions: LigneMission[];
  etudes: EtudeChoisissable[];
  typesConnus?: string[];
  message?: string;
}) {
  if (missions.length === 0) {
    return <p className="carte p-10 text-center text-sm text-attenue">{message}</p>;
  }

  const groupes = new Map<string, { libelle: string; missions: LigneMission[] }>();
  for (const m of missions) {
    const cle = cleType(m.tache.type);
    if (!groupes.has(cle)) {
      groupes.set(cle, { libelle: m.tache.type?.trim() || "Sans type", missions: [] });
    }
    groupes.get(cle)!.missions.push(m);
  }

  const tries = [...groupes.entries()].sort(([a, ga], [b, gb]) => {
    if (a === "") return 1;
    if (b === "") return -1;
    return ga.libelle.localeCompare(gb.libelle, "fr", { sensitivity: "base" });
  });

  return (
    <div className="space-y-6">
      {tries.map(([cle, g]) => {
        // Chaque étude compte une fois par mission : c'est l'unité de travail.
        const unites = g.missions.flatMap((m) =>
          (m.lignesEtudes ?? []).length > 0
            ? m.lignesEtudes!.map((l) => ({ statut: l.statut }))
            : [{ statut: m.tache.statut }],
        );
        const a = avancement(unites);
        const nbEtudes = new Set(
          g.missions.flatMap((m) =>
            (m.lignesEtudes ?? []).length > 0
              ? m.lignesEtudes!.map((l) => l.etudeId)
              : m.tache.etudeId
                ? [m.tache.etudeId]
                : [],
          ),
        ).size;

        return (
          <section key={cle || "sans"}>
            <h2 className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
              <span className="font-titre text-base font-bold">{g.libelle}</span>
              <span className="chiffres text-xs text-attenue">
                {g.missions.length} mission{g.missions.length > 1 ? "s" : ""} · {nbEtudes} étude
                {nbEtudes > 1 ? "s" : ""} · {a.faites}/{a.total} terminée{a.faites > 1 ? "s" : ""}
              </span>
            </h2>
            <TableauMissions lignes={g.missions} etudes={etudes} typesConnus={typesConnus} />
          </section>
        );
      })}
    </div>
  );
}
