import Link from "next/link";
import { AvancementMission, NoteEtudeMission, StatutEtudeMission } from "./etudes-mission";
import SelecteurStatut from "./selecteur-statut";
import TableauMissions, { type LigneMission } from "./tableau-missions";
import { EtiquettePriorite } from "./etiquettes";
import { droitsSurMission, etudesModifiables, type CompteChoix, type EtudeLiee, type MembreAttribution } from "@/lib/attribution";
import { formaterDate, sigleEtude } from "@/lib/format";
import { avancement, cleType } from "@/lib/missions";
import type { Etude } from "@/db/schema";

/** Ce qu'il faut pour calculer, mission par mission, qui peut quoi. */
type Droits = {
  utilisateurId?: number;
  pilote?: boolean;
  niveauxPartage?: Record<number, string>;
};

/** Peut-on changer l'avancement de cette mission pour cette étude-là ? */
function peutEcrireEtude(ligne: LigneMission, etudeId: number, d: Droits): boolean {
  const ecrire = peutEcrire(ligne, d);
  if (d.utilisateurId == null) return ecrire;
  return etudesModifiables({
    utilisateurId: d.utilisateurId,
    pilote: d.pilote,
    peutEcrire: ecrire,
    proprietaireId: ligne.tache.proprietaireId,
    assigneA: ligne.tache.assigneA,
    etudesLiees: ligne.etudesLiees ?? [],
  }).includes(etudeId);
}

function peutEcrire(ligne: LigneMission, d: Droits): boolean {
  if (d.utilisateurId == null) return ligne.peutEcrire ?? true;
  const etudesLiees = ligne.etudesLiees ?? [];
  return droitsSurMission({
    utilisateurId: d.utilisateurId,
    pilote: d.pilote,
    proprietaireId: ligne.tache.proprietaireId,
    etudeIds: etudesLiees.map((e) => e.id),
    etudesLiees,
    assigneA: ligne.tache.assigneA,
    niveauxPartage: d.niveauxPartage,
  }).peutEcrire;
}

/* -------------------------------------------------------------------------- */
/*  Par étude                                                                 */
/* -------------------------------------------------------------------------- */

/** Ce qu'une mission demande à une étude : la mission, et son avancement ici. */
type Element = { mission: LigneMission; etude?: EtudeLiee; multi: boolean };

type GroupeEtude = {
  etudeId: number | null;
  nom: string;
  code: string | null;
  couleur: string;
  elements: Element[];
};

/** Statut de la mission pour cette étude-là : le sien propre si elle en a plusieurs. */
const statutDe = (e: Element) =>
  e.multi ? (e.etude?.statut ?? "a_faire") : e.mission.tache.statut;
const estClos = (e: Element) => ["terminee", "sans_objet"].includes(statutDe(e));

/**
 * Éclate les missions étude par étude : une mission sur vingt études apparaît
 * sous chacune des vingt, avec l'avancement propre à chacune.
 */
function regrouperParEtude(missions: LigneMission[]): GroupeEtude[] {
  const groupes = new Map<number | null, GroupeEtude>();
  const ajouter = (
    etudeId: number | null,
    infos: Omit<GroupeEtude, "etudeId" | "elements">,
    element: Element,
  ) => {
    if (!groupes.has(etudeId)) groupes.set(etudeId, { etudeId, ...infos, elements: [] });
    groupes.get(etudeId)!.elements.push(element);
  };

  for (const m of missions) {
    const liees = m.etudesLiees ?? [];
    if (liees.length > 0) {
      for (const e of liees) {
        ajouter(e.id, { nom: e.nom, code: e.code, couleur: e.couleur }, {
          mission: m,
          etude: e,
          multi: liees.length > 1,
        });
      }
    } else if (m.tache.etudeId && m.etudeNom) {
      ajouter(
        m.tache.etudeId,
        { nom: m.etudeNom, code: m.etudeCode ?? null, couleur: m.etudeCouleur ?? "#a8a29e" },
        { mission: m, multi: false },
      );
    } else {
      ajouter(null, { nom: "Sans étude", code: null, couleur: "#a8a29e" }, { mission: m, multi: false });
    }
  }

  // Ordre alphabétique des acronymes ; « Sans étude » ferme la marche.
  return [...groupes.values()].sort((a, b) => {
    if (a.etudeId === null) return 1;
    if (b.etudeId === null) return -1;
    return sigleEtude(a).localeCompare(sigleEtude(b), "fr", { sensitivity: "base" });
  });
}

export function VueParEtude({
  missions,
  etudeId,
  statut,
  masquerTerminees = false,
  message = "Aucune mission.",
  ...droits
}: {
  missions: LigneMission[];
  /** Ne montrer que cette étude. */
  etudeId?: number | null;
  /** Filtre sur l'avancement propre à chaque étude, pas sur celui de la mission. */
  statut?: string;
  masquerTerminees?: boolean;
  message?: string;
} & Droits) {
  const maintenant = Math.floor(Date.now() / 1000);

  const groupes = regrouperParEtude(missions)
    .filter((g) => !etudeId || g.etudeId === etudeId)
    .map((g) => ({
      ...g,
      elements: g.elements.filter((e) => {
        if (statut && statutDe(e) !== statut) return false;
        if (masquerTerminees && estClos(e)) return false;
        return true;
      }),
    }))
    .filter((g) => g.elements.length > 0);

  if (groupes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ligne bg-creux/30 p-10 text-center text-sm text-attenue">
        {message}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groupes.map((g) => {
        const ouverts = g.elements.filter((e) => !estClos(e)).length;
        const enRetard = g.elements.filter(
          (e) => !estClos(e) && e.mission.tache.echeance && e.mission.tache.echeance < maintenant,
        ).length;

        return (
          <details key={g.etudeId ?? "sans"} open={ouverts > 0} className="bloc-app group/etude !p-0">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 sm:px-5">
              <span aria-hidden className="text-xs text-attenue transition-transform group-open/etude:rotate-90">
                ▸
              </span>
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-inset ring-black/5"
                style={{ backgroundColor: g.couleur }}
              />
              <span className="min-w-0 flex-1 truncate">
                {g.code && <span className="mr-2 font-titre font-bold">{g.code}</span>}
                <span className={g.code ? "text-sm text-attenue" : "font-titre font-bold"}>{g.nom}</span>
              </span>
              <span className="chiffres text-xs text-attenue">
                {ouverts} ouverte{ouverts > 1 ? "s" : ""} / {g.elements.length}
                {enRetard > 0 && <span className="text-alerte"> · {enRetard} en retard</span>}
              </span>
              <AvancementMission lignes={g.elements.map((e) => ({ statut: statutDe(e) }))} />
              {g.etudeId && (
                <Link
                  href={`/etudes/${g.etudeId}?section=missions`}
                  className="text-xs font-medium text-accent-appuye hover:underline"
                >
                  Dossier
                </Link>
              )}
            </summary>

            <ul className="divide-y divide-ligne/70 border-t border-ligne/80">
              {g.elements.map((e) => (
                <LigneParEtude
                  key={`${e.mission.tache.id}-${e.etude?.id ?? "m"}`}
                  element={e}
                  ecrire={
                    !e.mission.tache.archiveeLe &&
                    (e.multi && e.etude
                      ? peutEcrireEtude(e.mission, e.etude.id, droits)
                      : peutEcrire(e.mission, droits))
                  }
                  maintenant={maintenant}
                />
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

function LigneParEtude({
  element: { mission, etude, multi },
  ecrire,
  maintenant,
}: {
  element: Element;
  ecrire: boolean;
  maintenant: number;
}) {
  const { tache } = mission;
  const statut = multi ? (etude?.statut ?? "a_faire") : tache.statut;
  const clos = statut === "terminee" || statut === "sans_objet";
  const enRetard = !clos && tache.echeance && tache.echeance < maintenant;
  const etapes = mission.sousTaches ?? [];
  const nbEtudes = mission.etudesLiees?.length ?? 0;

  return (
    <li className="grid items-center gap-x-3 gap-y-1 px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_9.5rem_6.5rem_minmax(0,14rem)] sm:px-5">
      <span className="flex min-w-0 flex-wrap items-center gap-2">
        <span className={clos ? "text-attenue line-through" : "font-medium"}>{tache.titre}</span>
        <EtiquettePriorite priorite={tache.priorite} />
        {tache.type && <span className="etiquette bg-creux text-attenue">{tache.type}</span>}
        {multi && (
          <span className="text-xs text-efface" title="Mission portée sur plusieurs études">
            · {nbEtudes} études
          </span>
        )}
        {etapes.length > 0 && (
          <span className="chiffres text-xs text-efface">
            · {etapes.filter((s) => s.faite).length}/{etapes.length} étapes
          </span>
        )}
      </span>
      <span>
        {multi && etude ? (
          <StatutEtudeMission tacheId={tache.id} etude={etude} verrouille={!ecrire} />
        ) : (
          <SelecteurStatut id={tache.id} statut={tache.statut} verrouille={etapes.length > 0 || !ecrire} />
        )}
      </span>
      <span className="chiffres text-xs">
        {tache.echeance ? (
          <span className={enRetard ? "font-semibold text-alerte" : "text-attenue"}>
            {enRetard && "⚠ "}
            {formaterDate(tache.echeance)}
          </span>
        ) : (
          <span className="text-efface">Sans échéance</span>
        )}
      </span>
      <span className="min-w-0">
        {multi && etude ? (
          <NoteEtudeMission tacheId={tache.id} etude={etude} lectureSeule={!ecrire} />
        ) : tache.notes ? (
          <span className="line-clamp-2 text-xs text-attenue">{tache.notes}</span>
        ) : null}
      </span>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Par type                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Regroupe les missions par type — « Archivage : ces vingt études » — en
 * gardant, pour chaque mission, sa carte et son avancement étude par étude.
 */
export function VueParType({
  missions,
  etudes,
  membres,
  comptes,
  message = "Aucune mission.",
  ...droits
}: {
  missions: LigneMission[];
  etudes: Pick<Etude, "id" | "nom" | "code">[];
  membres?: MembreAttribution[];
  comptes?: CompteChoix[];
  message?: string;
} & Droits) {
  if (missions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ligne bg-creux/30 p-10 text-center text-sm text-attenue">
        {message}
      </p>
    );
  }

  const groupes = new Map<string, { libelle: string; missions: LigneMission[] }>();
  for (const m of missions) {
    const cle = cleType(m.tache.type);
    if (!groupes.has(cle)) groupes.set(cle, { libelle: m.tache.type?.trim() || "Sans type", missions: [] });
    groupes.get(cle)!.missions.push(m);
  }

  const tries = [...groupes.entries()].sort(([a, ga], [b, gb]) => {
    if (a === "") return 1;
    if (b === "") return -1;
    return ga.libelle.localeCompare(gb.libelle, "fr", { sensitivity: "base" });
  });

  return (
    <div className="space-y-5">
      {tries.map(([cle, g]) => {
        // Chaque étude compte une fois par mission : c'est l'unité de travail.
        const unites = g.missions.flatMap((m) =>
          (m.etudesLiees ?? []).length > 1
            ? m.etudesLiees!.map((e) => ({ statut: e.statut ?? "a_faire" }))
            : [{ statut: m.tache.statut }],
        );
        const a = avancement(unites);
        const nbEtudes = new Set(
          g.missions.flatMap((m) =>
            (m.etudesLiees ?? []).length > 0
              ? m.etudesLiees!.map((e) => e.id)
              : m.tache.etudeId
                ? [m.tache.etudeId]
                : [],
          ),
        ).size;

        return (
          <section key={cle || "sans"} className="bloc-app">
            <h2 className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-titre text-lg font-bold">{g.libelle}</span>
              <span className="chiffres text-sm text-attenue">
                {g.missions.length} mission{g.missions.length > 1 ? "s" : ""} · {nbEtudes} étude
                {nbEtudes > 1 ? "s" : ""} · {a.faites}/{a.total} terminée{a.faites > 1 ? "s" : ""}
              </span>
            </h2>
            <TableauMissions
              lignes={g.missions}
              etudes={etudes}
              membres={membres}
              comptes={comptes}
              utilisateurId={droits.utilisateurId}
              pilote={droits.pilote}
              niveauxPartage={droits.niveauxPartage}
            />
          </section>
        );
      })}
    </div>
  );
}
