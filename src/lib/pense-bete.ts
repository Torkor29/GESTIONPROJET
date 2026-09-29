/** Catégories proposées à la création d'une page, si aucune n'existe encore. */
export const SUGGESTIONS_CATEGORIE = [
  "À retenir",
  "Réunions",
  "Procédures",
  "Listes",
  "Idées",
] as const;

export const SANS_CATEGORIE = "Sans catégorie";

export function nomCategorie(categorie: string | null | undefined): string {
  const nom = (categorie ?? "").trim();
  return nom || SANS_CATEGORIE;
}

export function grouperParCategorie<T extends { categorie?: string | null }>(
  pages: T[],
): { nom: string; pages: T[] }[] {
  const map = new Map<string, T[]>();
  for (const p of pages) {
    const nom = nomCategorie(p.categorie);
    const deja = map.get(nom);
    if (deja) deja.push(p);
    else map.set(nom, [p]);
  }

  const sans = map.get(SANS_CATEGORIE);
  map.delete(SANS_CATEGORIE);

  const groupes = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr", { sensitivity: "base" }))
    .map(([nom, liste]) => ({ nom, pages: liste }));

  if (sans && sans.length > 0) groupes.push({ nom: SANS_CATEGORIE, pages: sans });
  return groupes;
}

/** Catégories déjà utilisées, plus les suggestions encore absentes. */
export function categoriesProposees(existantes: readonly string[]): string[] {
  const vues = new Set<string>();
  const liste: string[] = [];
  for (const brut of [...existantes, ...SUGGESTIONS_CATEGORIE]) {
    const nom = brut.trim();
    if (!nom) continue;
    const cle = nom.toLocaleLowerCase("fr");
    if (vues.has(cle)) continue;
    vues.add(cle);
    liste.push(nom);
  }
  return liste;
}
