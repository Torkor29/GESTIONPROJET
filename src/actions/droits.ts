"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { estAdministrateur, exigerSession } from "@/lib/auth";

/**
 * Accorde ou retire le droit « accès à toutes les études ».
 *
 * Réservé à l'administrateur de l'installation : ce droit ouvre les études de
 * tout le monde, il ne se donne pas entre collègues comme un partage.
 */
export async function definirAccesToutesEtudes(utilisateurId: number, accorde: boolean) {
  const compte = await exigerSession();
  if (!estAdministrateur(compte.id)) {
    throw new Error("Seul l'administrateur de l'installation peut accorder ce droit.");
  }
  if (!Number.isInteger(utilisateurId) || utilisateurId <= 0) {
    throw new Error("Compte introuvable.");
  }

  db.update(utilisateurs)
    .set({ accesToutesEtudes: accorde })
    .where(eq(utilisateurs.id, utilisateurId))
    .run();

  revalidatePath("/", "layout");
}
