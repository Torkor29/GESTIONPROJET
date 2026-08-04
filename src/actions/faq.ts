"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { faq } from "@/db/schema";
import { estConnecte, exigerSession } from "@/lib/auth";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

export async function creerFaq(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const question = String(donnees.get("question") ?? "").trim();
    const reponse = String(donnees.get("reponse") ?? "").trim();
    if (!question) return { erreur: "La question est obligatoire." };
    if (!reponse) return { erreur: "La réponse est obligatoire." };

    const etudeIdBrut = donnees.get("etudeId");

    await db.insert(faq).values({
      etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
      question,
      reponse,
      categorie: String(donnees.get("categorie") ?? "general"),
    });

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierFaq(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Entrée introuvable." };

    const question = String(donnees.get("question") ?? "").trim();
    const reponse = String(donnees.get("reponse") ?? "").trim();
    if (!question) return { erreur: "La question est obligatoire." };
    if (!reponse) return { erreur: "La réponse est obligatoire." };

    const etudeIdBrut = donnees.get("etudeId");

    await db
      .update(faq)
      .set({
        etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
        question,
        reponse,
        categorie: String(donnees.get("categorie") ?? "general"),
        modifieLe: maintenant(),
      })
      .where(eq(faq.id, id));

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function supprimerFaq(donnees: FormData) {
  await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Entrée manquante.");

  await db.delete(faq).where(eq(faq.id, id));
  revalidatePath("/", "layout");
}
