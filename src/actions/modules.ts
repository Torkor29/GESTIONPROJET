"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { exigerSession } from "@/lib/auth";
import { CLES_SOCLE, module, modulesSuggeres } from "@/lib/modules";

export type EtatModules = { message?: string };

/**
 * Enregistre les modules cochés. Les clés inconnues sont écartées et le socle
 * est toujours réintroduit : la navigation ne peut pas se retrouver vide, même
 * si le formulaire est trafiqué.
 */
export async function enregistrerModules(
  _precedent: EtatModules,
  donnees: FormData,
): Promise<EtatModules> {
  const compte = await exigerSession();

  const coches = donnees
    .getAll("module")
    .map(String)
    .filter((cle) => module(cle) !== undefined);

  const retenus = [...new Set([...CLES_SOCLE, ...coches])];

  db.update(utilisateurs)
    .set({ modules: JSON.stringify(retenus) })
    .where(eq(utilisateurs.id, compte.id))
    .run();

  revalidatePath("/", "layout");
  return { message: "Vos modules sont enregistrés." };
}

/**
 * Applique la sélection suggérée pour un métier, et enregistre ce métier au
 * passage : changer de métier depuis les paramètres repart d'une base saine.
 */
export async function appliquerMetier(donnees: FormData): Promise<void> {
  const compte = await exigerSession();
  const role = String(donnees.get("role") ?? "");
  if (!["arc", "tec", "cp", "autre"].includes(role)) return;

  db.update(utilisateurs)
    .set({ role, modules: JSON.stringify(modulesSuggeres(role)) })
    .where(eq(utilisateurs.id, compte.id))
    .run();

  revalidatePath("/", "layout");
  redirect("/parametres");
}
