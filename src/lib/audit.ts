import "server-only";
import { db } from "@/db";
import { journauxAudit } from "@/db/schema";

type EntreeAudit = {
  utilisateurId: number | null;
  action: string;
  objetType: string;
  objetId?: number | null;
  etudeId?: number | null;
  ancienneValeur?: unknown;
  nouvelleValeur?: unknown;
};

function serialiser(valeur: unknown): string | null {
  if (valeur === undefined || valeur === null) return null;
  try {
    return JSON.stringify(valeur);
  } catch {
    return String(valeur);
  }
}

/**
 * Écrit une ligne d'audit. Aucune mise à jour, aucune suppression : le
 * journal n'est pas exposé en écriture aux utilisateurs.
 */
export function enregistrerAudit(entree: EntreeAudit): void {
  db.insert(journauxAudit)
    .values({
      utilisateurId: entree.utilisateurId,
      action: entree.action,
      objetType: entree.objetType,
      objetId: entree.objetId ?? null,
      etudeId: entree.etudeId ?? null,
      ancienneValeur: serialiser(entree.ancienneValeur),
      nouvelleValeur: serialiser(entree.nouvelleValeur),
    })
    .run();
}
