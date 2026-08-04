"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { temps } from "@/db/schema";
import { estConnecte, exigerSession } from "@/lib/auth";
import { analyserDuree, analyserHeure } from "@/lib/duree";
import { depuisChampDate } from "@/lib/format";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

/**
 * Arrête le chronomètre en cours, s'il y en a un.
 * Un chrono arrêté en moins d'une minute est jeté plutôt qu'enregistré : c'est
 * un démarrage par erreur, et ça évite de polluer la liste de lignes à 0 min.
 */
async function arreterChronosOuverts(): Promise<void> {
  const seuil = maintenant() - 60;
  await db.delete(temps).where(and(isNull(temps.fin), gt(temps.debut, seuil)));
  await db.update(temps).set({ fin: maintenant() }).where(isNull(temps.fin));
}

/**
 * Démarre un chronomètre. Un seul peut tourner à la fois : le précédent est
 * arrêté automatiquement, on ne peut donc pas compter deux fois la même heure.
 */
export async function demarrerChrono(donnees: FormData) {
  await exigerSession();

  await arreterChronosOuverts();

  const etudeIdBrut = donnees.get("etudeId");
  const tacheIdBrut = donnees.get("tacheId");

  await db.insert(temps).values({
    etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
    tacheId: tacheIdBrut ? Number(tacheIdBrut) : null,
    description: String(donnees.get("description") ?? "").trim() || null,
    debut: maintenant(),
    fin: null,
  });

  revalidatePath("/", "layout");
}

export async function arreterChrono() {
  await exigerSession();
  await arreterChronosOuverts();
  revalidatePath("/", "layout");
}

/** Annule le chronomètre en cours sans rien enregistrer. */
export async function annulerChrono() {
  await exigerSession();
  await db.delete(temps).where(isNull(temps.fin));
  revalidatePath("/", "layout");
}

/** Lit et valide les champs communs à la saisie et à la modification. */
function lireSaisie(donnees: FormData) {
  const jour = depuisChampDate(String(donnees.get("date") ?? ""));
  if (!jour) return { erreur: "Date invalide." as const };

  const minutesDuree = analyserDuree(String(donnees.get("duree") ?? ""));
  if (minutesDuree === null || minutesDuree <= 0) {
    return { erreur: "Durée invalide. Exemples acceptés : 1h30, 1:30, 90min, 1,5." as const };
  }
  if (minutesDuree > 24 * 60) {
    return { erreur: "Une saisie ne peut pas dépasser 24 h." as const };
  }

  const minutesDebut = analyserHeure(String(donnees.get("heureDebut") ?? "")) ?? 9 * 60;
  const debut = jour + minutesDebut * 60;
  const etudeIdBrut = donnees.get("etudeId");

  return {
    valeurs: {
      etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
      description: String(donnees.get("description") ?? "").trim() || null,
      debut,
      fin: debut + minutesDuree * 60,
    },
  };
}

/** Saisie manuelle : date + heure de début + durée. */
export async function ajouterTemps(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const lu = lireSaisie(donnees);
    if (lu.erreur) return { erreur: lu.erreur };

    const tacheIdBrut = donnees.get("tacheId");
    await db.insert(temps).values({
      ...lu.valeurs,
      tacheId: tacheIdBrut ? Number(tacheIdBrut) : null,
    });

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierTemps(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Saisie introuvable." };

    const lu = lireSaisie(donnees);
    if (lu.erreur) return { erreur: lu.erreur };

    await db.update(temps).set(lu.valeurs).where(eq(temps.id, id));

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function supprimerTemps(donnees: FormData) {
  await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Entrée manquante.");

  await db.delete(temps).where(eq(temps.id, id));
  revalidatePath("/", "layout");
}
