/** Personne à qui une mission peut être attribuée, sur une étude donnée. */
export type MembreAttribution = {
  etudeId: number;
  utilisateurId: number;
  nom: string;
};

/** Compte existant, pour convier ou attribuer sans retaper l'adresse. */
export type CompteChoix = {
  id: number;
  nom: string;
  email: string;
};

/** Étude rattachée à une mission (une mission peut en concerner plusieurs). */
export type EtudeLiee = {
  id: number;
  nom: string;
  code: string | null;
  couleur: string;
  proprietaireId: number | null;
  /** Avancement propre à cette étude, sur une mission à plusieurs études. */
  statut?: string;
  notes?: string | null;
};

type VisibiliteMission = {
  utilisateurId: number;
  proprietaireId: number | null;
  assigneA: number | null;
  etudeIds: readonly number[];
  idsEtudesPossedees: ReadonlySet<number> | readonly number[];
};

function possede(ids: VisibiliteMission["idsEtudesPossedees"], etudeId: number): boolean {
  return Array.from(ids).includes(etudeId);
}

/**
 * Même règle que `missionVisible` en SQL : créateur, personne à qui c'est
 * attribué, ou propriétaire de l'une des études. Être convié ne suffit pas.
 */
export function missionEstVisiblePour({
  utilisateurId,
  proprietaireId,
  assigneA,
  etudeIds,
  idsEtudesPossedees,
}: VisibiliteMission): boolean {
  if (proprietaireId === utilisateurId) return true;
  if (assigneA === utilisateurId) return true;
  return etudeIds.some((id) => possede(idsEtudesPossedees, id));
}

export function droitsSurMission(opts: {
  utilisateurId: number;
  /** Droit « accès à toutes les études » : vaut propriété de chaque étude. */
  pilote?: boolean;
  proprietaireId: number | null;
  etudeIds: readonly number[];
  etudesLiees?: readonly Pick<EtudeLiee, "id" | "proprietaireId">[];
  assigneA: number | null;
  niveauxPartage?: Record<number, string>;
}): { peutGerer: boolean; peutEcrire: boolean } {
  const etudes = opts.etudesLiees ?? opts.etudeIds.map((id) => ({ id, proprietaireId: null }));
  const possedeEtude =
    (opts.pilote === true && etudes.length > 0) ||
    etudes.some((e) => e.proprietaireId === opts.utilisateurId);
  const estMissionPerso = etudes.length === 0 && opts.proprietaireId === opts.utilisateurId;
  const peutGerer = possedeEtude || estMissionPerso;
  const ecriture = etudes.some((e) => opts.niveauxPartage?.[e.id] === "ecriture");
  const peutEcrire = peutGerer || (opts.assigneA === opts.utilisateurId && ecriture);
  return { peutGerer, peutEcrire };
}

/**
 * Études dont la personne peut changer l'avancement, sur une mission à
 * plusieurs études. Même règle que côté serveur : qui porte la mission les
 * avance toutes ; sinon, chacun avance les études qu'il pilote.
 */
export function etudesModifiables(opts: {
  utilisateurId: number;
  pilote?: boolean;
  peutEcrire: boolean;
  proprietaireId: number | null;
  assigneA: number | null;
  etudesLiees: readonly Pick<EtudeLiee, "id" | "proprietaireId">[];
}): number[] {
  if (!opts.peutEcrire) return [];
  const porte =
    opts.pilote === true ||
    opts.proprietaireId === opts.utilisateurId ||
    opts.assigneA === opts.utilisateurId;
  return opts.etudesLiees
    .filter((e) => porte || e.proprietaireId === opts.utilisateurId)
    .map((e) => e.id);
}
