"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { exigerSession } from "@/lib/auth";

/** Jours d'avance du rappel automatique avant échéance ; 0 le désactive. */
export async function enregistrerRappelJours(donnees: FormData): Promise<void> {
  const compte = await exigerSession();
  const jours = Number(donnees.get("rappelJours"));
  if (!Number.isInteger(jours) || jours < 0 || jours > 60) {
    throw new Error("Choisissez un nombre de jours entre 0 et 60.");
  }
  db.update(utilisateurs).set({ rappelJours: jours }).where(eq(utilisateurs.id, compte.id)).run();
  revalidatePath("/parametres");
}
