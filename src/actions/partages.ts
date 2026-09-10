"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { etudes, partages, taches, utilisateurs } from "@/db/schema";
import { exigerSession } from "@/lib/auth";

export type EtatPartage = { erreur?: string; message?: string };

const NIVEAUX = new Set(["lecture", "ecriture"]);

/**
 * Seul le propriétaire d'une étude décide qui y accède.
 *
 * Une personne conviée en écriture peut modifier le contenu, pas la liste des
 * invités : sinon un accès en lecture pourrait s'élargir tout seul, de proche
 * en proche.
 */
async function exigerProprietaire(etudeId: number, utilisateurId: number) {
  const etude = db.select().from(etudes).where(eq(etudes.id, etudeId)).get();
  if (!etude || etude.proprietaireId !== utilisateurId) {
    throw new Error("Seul le propriétaire de l'étude peut gérer les accès.");
  }
  return etude;
}

export async function partagerEtude(
  _precedent: EtatPartage,
  donnees: FormData,
): Promise<EtatPartage> {
  try {
    const compte = await exigerSession();

    const etudeId = Number(donnees.get("etudeId"));
    const email = String(donnees.get("email") ?? "").trim().toLowerCase();
    const niveau = String(donnees.get("niveau") ?? "lecture");

    if (!etudeId) return { erreur: "Étude introuvable." };
    await exigerProprietaire(etudeId, compte.id);

    const beneficiaire = db.select().from(utilisateurs).where(eq(utilisateurs.email, email)).get();
    if (!beneficiaire) {
      return {
        erreur: "Personne n'a de compte à cette adresse. Invitez-la d'abord depuis Modules > Équipe.",
      };
    }
    if (beneficiaire.id === compte.id) {
      return { erreur: "Vous êtes déjà propriétaire de cette étude." };
    }

    // Un second partage sur la même personne ajuste son niveau plutôt que
    // d'ajouter une ligne : l'index d'unicité l'impose, et c'est ce qu'on veut.
    const existant = db
      .select()
      .from(partages)
      .where(
        and(
          eq(partages.type, "etude"),
          eq(partages.ressourceId, etudeId),
          eq(partages.utilisateurId, beneficiaire.id),
        ),
      )
      .get();

    if (existant) {
      db.update(partages)
        .set({ niveau: NIVEAUX.has(niveau) ? niveau : "lecture" })
        .where(eq(partages.id, existant.id))
        .run();
    } else {
      db.insert(partages)
        .values({
          type: "etude",
          ressourceId: etudeId,
          utilisateurId: beneficiaire.id,
          niveau: NIVEAUX.has(niveau) ? niveau : "lecture",
          partagePar: compte.id,
        })
        .run();
    }

    revalidatePath("/", "layout");
    return { message: `${beneficiaire.nom} a maintenant accès à cette étude. Attribuez-lui des missions pour qu'elles apparaissent chez elle.` };
  } catch (e) {
    return { erreur: e instanceof Error ? e.message : "Le partage a échoué." };
  }
}

export async function retirerPartage(donnees: FormData): Promise<void> {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) return;

  const partage = db.select().from(partages).where(eq(partages.id, id)).get();
  if (!partage) return;

  await exigerProprietaire(partage.ressourceId, compte.id);

  db.update(taches)
    .set({ assigneA: null })
    .where(
      and(
        eq(taches.assigneA, partage.utilisateurId),
        sql`(
          ${taches.etudeId} = ${partage.ressourceId}
          or ${taches.id} in (
            select tache_id from taches_etudes where etude_id = ${partage.ressourceId}
          )
        )`,
      ),
    )
    .run();

  db.delete(partages).where(eq(partages.id, id)).run();
  revalidatePath("/", "layout");
}

/** Les personnes conviées sur une étude, pour les afficher au propriétaire. */
export async function invitesDeLEtude(etudeId: number) {
  return db
    .select({
      id: partages.id,
      utilisateurId: partages.utilisateurId,
      niveau: partages.niveau,
      nom: utilisateurs.nom,
      email: utilisateurs.email,
    })
    .from(partages)
    .innerJoin(utilisateurs, eq(partages.utilisateurId, utilisateurs.id))
    .where(and(eq(partages.type, "etude"), eq(partages.ressourceId, etudeId)))
    .orderBy(utilisateurs.nom);
}

/** Comptes joignables pour un partage : tout le monde sauf soi-même. */
export async function comptesDisponibles(sauf: number) {
  return db
    .select({ id: utilisateurs.id, nom: utilisateurs.nom, email: utilisateurs.email })
    .from(utilisateurs)
    .where(and(ne(utilisateurs.id, sauf), eq(utilisateurs.actif, true)))
    .orderBy(utilisateurs.nom);
}

/**
 * Si la personne n'est pas encore sur l'étude, l'y convie en écriture
 * pour qu'elle puisse avancer les missions qu'on lui attribue.
 */
export async function assurerPartageEtude(
  etudeId: number,
  utilisateurId: number,
  parId: number,
): Promise<void> {
  const etude = db.select().from(etudes).where(eq(etudes.id, etudeId)).get();
  if (!etude) throw new Error("Étude introuvable.");
  if (etude.proprietaireId === utilisateurId) return;

  const existant = db
    .select({ id: partages.id })
    .from(partages)
    .where(
      and(
        eq(partages.type, "etude"),
        eq(partages.ressourceId, etudeId),
        eq(partages.utilisateurId, utilisateurId),
      ),
    )
    .get();
  if (existant) return;

  db.insert(partages)
    .values({
      type: "etude",
      ressourceId: etudeId,
      utilisateurId,
      niveau: "ecriture",
      partagePar: parId,
    })
    .run();
}
