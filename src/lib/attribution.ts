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

type VisibiliteMission = {
  utilisateurId: number;
  proprietaireId: number | null;
  assigneA: number | null;
  etudeId: number | null;
  idsEtudesPossedees: ReadonlySet<number> | readonly number[];
};

function possede(ids: VisibiliteMission["idsEtudesPossedees"], etudeId: number): boolean {
  return Array.from(ids).includes(etudeId);
}

/**
 * Même règle que `missionVisible` en SQL : créateur, personne à qui c'est
 * attribué, ou propriétaire de l'étude. Être convié sur l'étude ne suffit pas.
 */
export function missionEstVisiblePour({
  utilisateurId,
  proprietaireId,
  assigneA,
  etudeId,
  idsEtudesPossedees,
}: VisibiliteMission): boolean {
  if (proprietaireId === utilisateurId) return true;
  if (assigneA === utilisateurId) return true;
  if (etudeId != null && possede(idsEtudesPossedees, etudeId)) return true;
  return false;
}

export function droitsSurMission(opts: {
  utilisateurId: number;
  proprietaireId: number | null;
  etudeId: number | null;
  etudeProprietaireId: number | null | undefined;
  assigneA: number | null;
  niveauPartage: string | null | undefined;
}): { peutGerer: boolean; peutEcrire: boolean } {
  const estProprietaireEtude = opts.etudeProprietaireId === opts.utilisateurId;
  const estMissionPerso = opts.etudeId == null && opts.proprietaireId === opts.utilisateurId;
  const peutGerer = estProprietaireEtude || estMissionPerso;
  const peutEcrire =
    peutGerer || (opts.assigneA === opts.utilisateurId && opts.niveauPartage === "ecriture");
  return { peutGerer, peutEcrire };
}
