import { LIBELLES_STATUT_MISSION } from "./constantes";
import {
  LIBELLES_PRIORITE,
  SECONDES_PAR_JOUR,
  depuisChampDate,
  formaterDate,
  formaterDuree,
} from "./format";

/** Mission déjà chargée, prête à être mise en ligne de suivi. */
export type MissionPourExtraction = {
  tache: {
    id: number;
    titre: string;
    notes: string | null;
    statut: string;
    priorite: string;
    echeance: number | null;
    assigneA: number | null;
    creeLe: number;
    modifieLe: number;
    termineeLe: number | null;
    archiveeLe: number | null;
    etudeId: number | null;
  };
  assigneNom?: string | null;
  etudeNom?: string | null;
  etudeCode?: string | null;
  etudesLiees?: { id?: number; nom: string; code: string | null }[];
  sousTaches?: { id?: number; titre: string; faite: boolean }[];
  minutes?: number;
};

export type FiltresExtraction = {
  etudeId?: number | null;
  statut?: string;
  assigneA?: number | null | "non";
  du?: number | null;
  au?: number | null;
};

export type LigneSuivi = {
  id: number;
  titre: string;
  etude: string;
  etudeNoms: string;
  assignee: string;
  statut: string;
  statutCle: string;
  priorite: string;
  echeance: string;
  enRetard: boolean;
  delai: string;
  commentaire: string;
  etapesResume: string;
  etapesDetail: string;
  temps: string;
  creeLe: string;
  modifieLe: string;
  termineeLe: string;
  archivee: boolean;
};

export type LigneEtapeSuivi = {
  mission: string;
  etude: string;
  etape: string;
  etat: string;
};

export type SyntheseSuivi = {
  total: number;
  aFaire: number;
  enCours: number;
  terminees: number;
  enRetard: number;
};

function dateTexte(secondes: number | null | undefined): string {
  if (!secondes) return "";
  return formaterDate(secondes);
}

export function libelleEtudes(m: MissionPourExtraction): { sigles: string; noms: string } {
  const liees = m.etudesLiees ?? [];
  if (liees.length > 0) {
    return {
      sigles: liees.map((e) => (e.code ?? "").trim() || e.nom).join(" · "),
      noms: liees.map((e) => e.nom).join(" · "),
    };
  }
  const nom = m.etudeNom ?? "Sans étude";
  const code = (m.etudeCode ?? "").trim();
  return { sigles: code || nom, noms: nom };
}

/** Positif = jours de retard, négatif = jours restants, null = pas d'échéance. */
export function joursDelai(
  echeance: number | null,
  maintenant: number,
  terminee: boolean,
): number | null {
  if (!echeance || terminee) return null;
  return Math.round((maintenant - echeance) / SECONDES_PAR_JOUR);
}

export function libelleDelai(jours: number | null): string {
  if (jours === null) return "";
  if (jours > 0) return `${jours} j de retard`;
  if (jours < 0) return `dans ${-jours} j`;
  return "aujourd'hui";
}

export function detailEtapes(etapes: { titre: string; faite: boolean }[]): string {
  if (etapes.length === 0) return "";
  return etapes.map((e) => `${e.faite ? "✓" : "○"} ${e.titre}`).join("\n");
}

export function filtrerMissions(
  lignes: MissionPourExtraction[],
  filtres: FiltresExtraction,
): MissionPourExtraction[] {
  return lignes.filter((l) => {
    if (filtres.etudeId) {
      const etudeIds = (l.etudesLiees ?? [])
        .map((e) => e.id)
        .filter((n): n is number => typeof n === "number");
      if (etudeIds.length > 0) {
        if (!etudeIds.includes(filtres.etudeId)) return false;
      } else if (l.tache.etudeId !== filtres.etudeId) {
        return false;
      }
    }
    if (filtres.statut && l.tache.statut !== filtres.statut) return false;
    if (filtres.assigneA === "non") {
      if (l.tache.assigneA) return false;
    } else if (typeof filtres.assigneA === "number") {
      if (l.tache.assigneA !== filtres.assigneA) return false;
    }
    if (filtres.du || filtres.au) {
      const e = l.tache.echeance;
      if (e) {
        if (filtres.du && e < filtres.du) return false;
        if (filtres.au && e > filtres.au) return false;
      }
    }
    return true;
  });
}

export function ligneSuivi(m: MissionPourExtraction, maintenant: number): LigneSuivi {
  const { sigles, noms } = libelleEtudes(m);
  const terminee = m.tache.statut === "terminee";
  const jours = joursDelai(m.tache.echeance, maintenant, terminee);
  const etapes = m.sousTaches ?? [];
  const faites = etapes.filter((e) => e.faite).length;
  const enRetard = Boolean(!terminee && m.tache.echeance && m.tache.echeance < maintenant);

  return {
    id: m.tache.id,
    titre: m.tache.titre,
    etude: sigles,
    etudeNoms: noms,
    assignee: m.assigneNom ?? "",
    statut: LIBELLES_STATUT_MISSION[m.tache.statut] ?? m.tache.statut,
    statutCle: m.tache.statut,
    priorite: LIBELLES_PRIORITE[m.tache.priorite] ?? m.tache.priorite,
    echeance: dateTexte(m.tache.echeance),
    enRetard,
    delai: libelleDelai(jours),
    commentaire: (m.tache.notes ?? "").trim(),
    etapesResume: etapes.length === 0 ? "" : `${faites}/${etapes.length}`,
    etapesDetail: detailEtapes(etapes),
    temps: m.minutes ? formaterDuree(m.minutes) : "",
    creeLe: dateTexte(m.tache.creeLe),
    modifieLe: dateTexte(m.tache.modifieLe),
    termineeLe: dateTexte(m.tache.termineeLe),
    archivee: Boolean(m.tache.archiveeLe),
  };
}

export function lignesSuivi(
  missions: MissionPourExtraction[],
  maintenant: number,
): LigneSuivi[] {
  const ordreStatut = { a_faire: 0, en_cours: 1, terminee: 2 };
  return missions
    .map((m) => ligneSuivi(m, maintenant))
    .sort((a, b) => {
      const etude = a.etude.localeCompare(b.etude, "fr", { sensitivity: "base" });
      if (etude) return etude;
      if (a.enRetard !== b.enRetard) return a.enRetard ? -1 : 1;
      const sa = ordreStatut[a.statutCle as keyof typeof ordreStatut] ?? 9;
      const sb = ordreStatut[b.statutCle as keyof typeof ordreStatut] ?? 9;
      if (sa !== sb) return sa - sb;
      return a.titre.localeCompare(b.titre, "fr", { sensitivity: "base" });
    });
}

export function lignesEtapes(missions: MissionPourExtraction[]): LigneEtapeSuivi[] {
  const lignes: LigneEtapeSuivi[] = [];
  for (const m of missions) {
    const { sigles } = libelleEtudes(m);
    for (const e of m.sousTaches ?? []) {
      lignes.push({
        mission: m.tache.titre,
        etude: sigles,
        etape: e.titre,
        etat: e.faite ? "Faite" : "À faire",
      });
    }
  }
  return lignes;
}

export function syntheseSuivi(lignes: LigneSuivi[]): SyntheseSuivi {
  return {
    total: lignes.length,
    aFaire: lignes.filter((l) => l.statutCle === "a_faire").length,
    enCours: lignes.filter((l) => l.statutCle === "en_cours").length,
    terminees: lignes.filter((l) => l.statutCle === "terminee").length,
    enRetard: lignes.filter((l) => l.enRetard).length,
  };
}

export function grouperParEtude(lignes: LigneSuivi[]): { etude: string; lignes: LigneSuivi[] }[] {
  const map = new Map<string, LigneSuivi[]>();
  for (const l of lignes) {
    const cle = l.etude || "Sans étude";
    const deja = map.get(cle);
    if (deja) deja.push(l);
    else map.set(cle, [l]);
  }
  return [...map.entries()].map(([etude, liste]) => ({ etude, lignes: liste }));
}

export function syntheseParEtude(
  lignes: LigneSuivi[],
): { etude: string; synthese: SyntheseSuivi }[] {
  return grouperParEtude(lignes).map((g) => ({
    etude: g.etude,
    synthese: syntheseSuivi(g.lignes),
  }));
}

/** Paramètres d'URL de la page Extractions, repris tels quels à l'export. */
export type ParamsExtraction = {
  etude?: string;
  statut?: string;
  assigne?: string;
  du?: string;
  au?: string;
  archives?: string;
};

export function lireFiltresExtraction(params: ParamsExtraction): {
  filtres: FiltresExtraction;
  archives: boolean;
} {
  const assigne = (params.assigne ?? "").trim();
  let assigneA: FiltresExtraction["assigneA"];
  if (assigne === "non") assigneA = "non";
  else if (assigne !== "" && Number.isFinite(Number(assigne))) assigneA = Number(assigne);

  const du = depuisChampDate(params.du ?? "");
  const auDebut = depuisChampDate(params.au ?? "");

  return {
    archives: params.archives === "1",
    filtres: {
      etudeId: params.etude ? Number(params.etude) : null,
      statut: params.statut || undefined,
      assigneA,
      du,
      // La borne supérieure inclut toute la journée saisie.
      au: auDebut === null ? null : auDebut + SECONDES_PAR_JOUR - 1,
    },
  };
}

export function parametresExportExtraction(params: ParamsExtraction): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.etude) out.etude = params.etude;
  if (params.statut) out.statut = params.statut;
  if (params.assigne) out.assigne = params.assigne;
  if (params.du) out.du = params.du;
  if (params.au) out.au = params.au;
  if (params.archives === "1") out.archives = "1";
  return out;
}

export const COLONNES_SUIVI: { cle: keyof LigneSuivi; entete: string; largeur: number }[] = [
  { cle: "titre", entete: "Mission", largeur: 42 },
  { cle: "etude", entete: "Étude", largeur: 16 },
  { cle: "etudeNoms", entete: "Étude (intitulé)", largeur: 28 },
  { cle: "assignee", entete: "Attribuée à", largeur: 20 },
  { cle: "statut", entete: "Statut", largeur: 14 },
  { cle: "priorite", entete: "Importance", largeur: 14 },
  { cle: "echeance", entete: "Échéance", largeur: 12 },
  { cle: "delai", entete: "Délai", largeur: 16 },
  { cle: "enRetard", entete: "En retard", largeur: 12 },
  { cle: "commentaire", entete: "Commentaire", largeur: 40 },
  { cle: "etapesResume", entete: "Étapes", largeur: 10 },
  { cle: "etapesDetail", entete: "Détail des étapes", largeur: 36 },
  { cle: "temps", entete: "Temps", largeur: 10 },
  { cle: "creeLe", entete: "Créée le", largeur: 12 },
  { cle: "modifieLe", entete: "Modifiée le", largeur: 12 },
  { cle: "termineeLe", entete: "Terminée le", largeur: 12 },
  { cle: "archivee", entete: "Archivée", largeur: 10 },
];

export function valeurSuivi(ligne: LigneSuivi, cle: keyof LigneSuivi): string {
  const v = ligne[cle];
  if (typeof v === "boolean") return v ? "OUI" : "";
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}
