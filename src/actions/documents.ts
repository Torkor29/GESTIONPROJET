"use server";

import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { estConnecte, exigerSession } from "@/lib/auth";
import { TAILLE_MAX_OCTETS, dossierUploads, nomSur } from "@/lib/fichiers";
import { depuisChampDate } from "@/lib/format";
import { type EtatFormulaire, messageErreur } from "./etat";

/** Dépose un document et crée sa fiche. Le fichier reste sur votre serveur. */
export async function televerserDocument(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const fichier = donnees.get("fichier");
    if (!(fichier instanceof File) || fichier.size === 0) {
      return { erreur: "Sélectionnez un fichier." };
    }
    if (fichier.size > TAILLE_MAX_OCTETS) {
      return {
        erreur: `Fichier trop volumineux (maximum ${TAILLE_MAX_OCTETS / 1024 / 1024} Mo).`,
      };
    }

    const dossier = dossierUploads();
    await fs.mkdir(dossier, { recursive: true });

    const nomFichier = `${randomBytes(8).toString("hex")}-${nomSur(fichier.name)}`;
    await fs.writeFile(
      path.join(dossier, nomFichier),
      Buffer.from(await fichier.arrayBuffer()),
    );

    const etudeIdBrut = donnees.get("etudeId");

    await db.insert(documents).values({
      etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
      nom: String(donnees.get("nom") ?? "").trim() || fichier.name,
      description: String(donnees.get("description") ?? "").trim() || null,
      categorie: String(donnees.get("categorie") ?? "autre"),
      version: String(donnees.get("version") ?? "").trim() || null,
      dateDocument: depuisChampDate(String(donnees.get("dateDocument") ?? "")),
      nomFichier,
      nomOriginal: fichier.name,
      taille: fichier.size,
      typeMime: fichier.type || "application/octet-stream",
    });

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/** Modifie la fiche d'un document sans toucher au fichier lui-même. */
export async function modifierDocument(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    if (!(await estConnecte())) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Document introuvable." };

    const nom = String(donnees.get("nom") ?? "").trim();
    if (!nom) return { erreur: "Le nom du document est obligatoire." };

    const etudeIdBrut = donnees.get("etudeId");

    await db
      .update(documents)
      .set({
        etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
        nom,
        description: String(donnees.get("description") ?? "").trim() || null,
        categorie: String(donnees.get("categorie") ?? "autre"),
        version: String(donnees.get("version") ?? "").trim() || null,
        dateDocument: depuisChampDate(String(donnees.get("dateDocument") ?? "")),
      })
      .where(eq(documents.id, id));

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function supprimerDocument(donnees: FormData) {
  await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Document manquant.");

  const [doc] = await db
    .select({ nomFichier: documents.nomFichier })
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  await db.delete(documents).where(eq(documents.id, id));

  // La fiche part d'abord : un fichier orphelin est moins gênant qu'une fiche
  // pointant vers un fichier disparu.
  if (doc) {
    await fs
      .unlink(path.join(dossierUploads(), nomSur(doc.nomFichier)))
      .catch(() => undefined);
  }

  revalidatePath("/", "layout");
}
