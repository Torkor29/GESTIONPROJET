/**
 * Règles des missions multi-études, partagées entre le serveur et le
 * navigateur : aucun accès à la base ici.
 */

/** Une étude au sein d'une mission multi-études, telle qu'on l'affiche. */
export type LigneEtudeMission = {
  id: number;
  tacheId: number;
  etudeId: number;
  statut: string;
  notes: string | null;
  etudeNom: string;
  etudeCode: string | null;
  etudeCouleur: string;
};

/**
 * Statut d'une mission déduit de celui de ses études : terminée quand toutes
 * celles qui comptent le sont, en cours dès que l'une a démarré.
 */
export function statutDeduit(statuts: string[]): string {
  const comptees = statuts.filter((s) => s !== "sans_objet");
  if (comptees.length === 0) return statuts.length > 0 ? "terminee" : "a_faire";
  if (comptees.every((s) => s === "terminee")) return "terminee";
  if (comptees.some((s) => s === "en_cours" || s === "terminee")) return "en_cours";
  return "a_faire";
}

/** Avancement d'une mission multi-études : les études « sans objet » n'y comptent pas. */
export function avancement(lignes: { statut: string }[]) {
  const comptees = lignes.filter((l) => l.statut !== "sans_objet");
  const faites = comptees.filter((l) => l.statut === "terminee").length;
  return {
    faites,
    total: comptees.length,
    pourcentage: comptees.length === 0 ? 100 : Math.round((faites / comptees.length) * 100),
  };
}

/** Clé de regroupement d'un type saisi librement : « archivage » = « Archivage ». */
export function cleType(type: string | null | undefined): string {
  return (type ?? "").trim().toLocaleLowerCase("fr");
}

/** Normalise un acronyme saisi à la volée : sans espaces superflus, en capitales. */
export function normaliserAcronyme(saisie: string): string {
  return saisie.trim().replace(/\s+/g, " ").toLocaleUpperCase("fr");
}
