/** Palette partagée études / missions. Toujours la même, pour s'y retrouver. */
export const PALETTE_COULEURS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#78716c",
] as const;

const AUTORISEES = new Set<string>(PALETTE_COULEURS);

export function lireCouleur(valeur: string | null | undefined): string | null {
  const brut = (valeur ?? "").trim().toLowerCase();
  return AUTORISEES.has(brut) ? brut : null;
}

/** Couleur d'affichage : celle de la mission, sinon celle de l'étude. */
export function couleurAffichee(
  mission: string | null | undefined,
  etude: string | null | undefined,
): string {
  return lireCouleur(mission) ?? etude ?? PALETTE_COULEURS[0];
}
