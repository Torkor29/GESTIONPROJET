"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { etudes } from "@/db/schema";
import { estConnecte, exigerSession } from "@/lib/auth";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

/** Renvoie le tarif, ou une erreur si la saisie n'est pas un nombre positif. */
function lireTarif(valeur: FormDataEntryValue | null):
  | { tarif: number | null }
  | { erreur: string } {
  const brut = String(valeur ?? "").replace(",", ".").trim();
  if (!brut) return { tarif: null };

  const n = Number(brut);
  if (!Number.isFinite(n) || n < 0) {
    return { erreur: "Tarif horaire invalide. Indiquez un nombre, par exemple 75." };
  }
  return { tarif: n };
}

export async function creerEtude(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  let nouvelId: number;

  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const nom = String(donnees.get("nom") ?? "").trim();
    if (!nom) return { erreur: "Le nom de l'étude est obligatoire." };

    const tarif = lireTarif(donnees.get("tarifHoraire"));
    if ("erreur" in tarif) return { erreur: tarif.erreur };

    const [creee] = await db
      .insert(etudes)
      .values({
        nom,
        client: String(donnees.get("client") ?? "").trim() || null,
        description: String(donnees.get("description") ?? "").trim() || null,
        couleur: String(donnees.get("couleur") ?? "#6366f1"),
        tarifHoraire: tarif.tarif,
      })
      .returning({ id: etudes.id });

    nouvelId = creee.id;
    revalidatePath("/", "layout");
  } catch (e) {
    return { erreur: messageErreur(e) };
  }

  // Hors du try : redirect() lève une exception interne qu'il ne faut pas capturer.
  redirect(`/etudes/${nouvelId}`);
}

export async function modifierEtude(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    const nom = String(donnees.get("nom") ?? "").trim();
    if (!id) return { erreur: "Étude introuvable." };
    if (!nom) return { erreur: "Le nom de l'étude est obligatoire." };

    const tarif = lireTarif(donnees.get("tarifHoraire"));
    if ("erreur" in tarif) return { erreur: tarif.erreur };

    await db
      .update(etudes)
      .set({
        nom,
        client: String(donnees.get("client") ?? "").trim() || null,
        description: String(donnees.get("description") ?? "").trim() || null,
        couleur: String(donnees.get("couleur") ?? "#6366f1"),
        statut: String(donnees.get("statut") ?? "active"),
        tarifHoraire: tarif.tarif,
        modifieLe: maintenant(),
      })
      .where(eq(etudes.id, id));

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function supprimerEtude(donnees: FormData) {
  await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Étude manquante.");

  // Les pages, tâches et temps rattachés partent avec (ON DELETE CASCADE).
  await db.delete(etudes).where(eq(etudes.id, id));

  revalidatePath("/", "layout");
  redirect("/etudes");
}
