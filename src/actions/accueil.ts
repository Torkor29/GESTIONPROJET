"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { WIDGETS_PAR_DEFAUT } from "@/lib/accueil";
import { exigerSession } from "@/lib/auth";

export type EtatAccueil = { message?: string; succes?: number };

/**
 * Enregistre les widgets cochés. Les clés inconnues sont écartées.
 * Une liste vide est acceptée : l'accueil affiche alors uniquement
 * le bouton pour les faire revenir.
 */
export async function enregistrerAccueil(
  _precedent: EtatAccueil,
  donnees: FormData,
): Promise<EtatAccueil> {
  const compte = await exigerSession();
  const cochees = new Set(donnees.getAll("widget").map(String));
  const retenus = WIDGETS_PAR_DEFAUT.filter((cle) => cochees.has(cle));

  db.update(utilisateurs)
    .set({ accueil: JSON.stringify(retenus) })
    .where(eq(utilisateurs.id, compte.id))
    .run();

  revalidatePath("/", "layout");
  return {
    message: "Votre accueil est enregistré.",
    succes: (_precedent.succes ?? 0) + 1,
  };
}
