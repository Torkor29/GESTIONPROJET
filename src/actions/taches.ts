"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { etudes, tacheEtudes, taches } from "@/db/schema";
import { etudeAccessible, exigerAcces, exigerAccesLigneMission } from "@/lib/acces";
import { exigerSession, utilisateurActuel } from "@/lib/auth";
import { LIBELLES_STATUT_LIGNE_MISSION } from "@/lib/constantes";
import { depuisChampDate } from "@/lib/format";
import { normaliserAcronyme, statutDeduit } from "@/lib/missions";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

/** Un acronyme n'est qu'une étiquette : au-delà, c'est une faute de frappe. */
const LONGUEUR_MAX_ACRONYME = 40;

/**
 * Retrouve l'étude désignée par un acronyme saisi à la volée, ou la crée.
 *
 * On cherche d'abord parmi les études accessibles — sans quoi deux personnes
 * tapant « PAPAYE » créeraient deux dossiers distincts. L'étude créée
 * appartient à qui l'a saisie ; on la complétera plus tard depuis sa fiche.
 */
async function etudeParAcronyme(acronyme: string, utilisateurId: number): Promise<number> {
  const [existante] = await db
    .select({ id: etudes.id })
    .from(etudes)
    .where(
      and(
        sql`(upper(${etudes.code}) = ${acronyme} or upper(${etudes.nom}) = ${acronyme})`,
        etudeAccessible(etudes.id, utilisateurId),
      ),
    )
    .limit(1);
  if (existante) return existante.id;

  const [creee] = await db
    .insert(etudes)
    .values({ proprietaireId: utilisateurId, nom: acronyme, code: acronyme })
    .returning({ id: etudes.id });
  return creee.id;
}

/**
 * Études choisies dans le formulaire : celles cochées, dont l'accès est
 * vérifié une à une, et les acronymes nouveaux, créés à la volée.
 */
async function lireEtudesChoisies(
  donnees: FormData,
  utilisateurId: number,
): Promise<{ ids: number[] } | { erreur: string }> {
  const ids = [
    ...donnees.getAll("etudeIds"),
    // L'ancien champ unique reste accepté.
    ...(donnees.get("etudeId") ? [donnees.get("etudeId")!] : []),
  ]
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);

  for (const id of new Set(ids)) await exigerAcces("etudes", id, utilisateurId);

  const acronymes = new Set(
    donnees
      .getAll("nouvellesEtudes")
      .map((v) => normaliserAcronyme(String(v)))
      .filter(Boolean),
  );
  for (const acronyme of acronymes) {
    if (acronyme.length > LONGUEUR_MAX_ACRONYME) {
      return { erreur: `L'acronyme « ${acronyme.slice(0, 20)}… » est trop long.` };
    }
    ids.push(await etudeParAcronyme(acronyme, utilisateurId));
  }

  return { ids: [...new Set(ids)] };
}

function lireType(donnees: FormData): string | null {
  return String(donnees.get("type") ?? "").trim().slice(0, 60) || null;
}

/** Recalcule le statut d'une mission multi-études à partir de celui de ses études. */
async function recalculerStatut(tacheId: number): Promise<void> {
  const lignes = await db
    .select({ statut: tacheEtudes.statut })
    .from(tacheEtudes)
    .where(eq(tacheEtudes.tacheId, tacheId));
  if (lignes.length === 0) return;

  const statut = statutDeduit(lignes.map((l) => l.statut));
  const [tache] = await db
    .select({ statut: taches.statut, termineeLe: taches.termineeLe })
    .from(taches)
    .where(eq(taches.id, tacheId))
    .limit(1);
  if (!tache) return;

  await db
    .update(taches)
    .set({
      statut,
      // Une mission déjà terminée garde sa date de fin d'origine.
      termineeLe: statut === "terminee" ? (tache.termineeLe ?? maintenant()) : null,
      modifieLe: maintenant(),
    })
    .where(eq(taches.id, tacheId));
}

export async function creerTache(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const titre = String(donnees.get("titre") ?? "").trim();
    if (!titre) return { erreur: "Le titre de la tâche est obligatoire." };

    const choix = await lireEtudesChoisies(donnees, compte.id);
    if ("erreur" in choix) return { erreur: choix.erreur };
    const multi = choix.ids.length > 1;

    const [creee] = await db
      .insert(taches)
      .values({
        proprietaireId: compte.id,
        etudeId: multi ? null : (choix.ids[0] ?? null),
        titre,
        type: lireType(donnees),
        notes: String(donnees.get("notes") ?? "").trim() || null,
        priorite: String(donnees.get("priorite") ?? "normale"),
        echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
      })
      .returning({ id: taches.id });

    if (multi) {
      await db
        .insert(tacheEtudes)
        .values(choix.ids.map((etudeId) => ({ tacheId: creee.id, etudeId })));
    }

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierTache(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    const titre = String(donnees.get("titre") ?? "").trim();
    if (!id) return { erreur: "Tâche introuvable." };
    await exigerAcces("taches", id, compte.id);
    if (!titre) return { erreur: "Le titre de la tâche est obligatoire." };

    const choix = await lireEtudesChoisies(donnees, compte.id);
    if ("erreur" in choix) return { erreur: choix.erreur };

    const [avant] = await db
      .select({ etudeId: taches.etudeId, statut: taches.statut })
      .from(taches)
      .where(eq(taches.id, id))
      .limit(1);
    const lignesAvant = await db
      .select({ id: tacheEtudes.id, etudeId: tacheEtudes.etudeId })
      .from(tacheEtudes)
      .where(eq(tacheEtudes.tacheId, id));

    // Une mission devient multi-études dès sa deuxième étude, et le reste tant
    // qu'elle en garde une : la repasser en simple effacerait l'avancement
    // étude par étude.
    const multi = choix.ids.length > 1 || (lignesAvant.length > 0 && choix.ids.length > 0);
    const statutSaisi = String(donnees.get("statut") ?? avant?.statut ?? "a_faire");

    const communs = {
      titre,
      type: lireType(donnees),
      notes: String(donnees.get("notes") ?? "").trim() || null,
      priorite: String(donnees.get("priorite") ?? "normale"),
      echeance: depuisChampDate(String(donnees.get("echeance") ?? "")),
      modifieLe: maintenant(),
    };

    if (!multi) {
      await db.delete(tacheEtudes).where(eq(tacheEtudes.tacheId, id));
      await db
        .update(taches)
        .set({
          ...communs,
          etudeId: choix.ids[0] ?? null,
          statut: statutSaisi,
          termineeLe: statutSaisi === "terminee" ? maintenant() : null,
        })
        .where(eq(taches.id, id));
    } else {
      await db
        .update(taches)
        .set({ ...communs, etudeId: null })
        .where(eq(taches.id, id));

      // On ne retire que les études que la personne voit dans le formulaire :
      // une étude qui lui est devenue inaccessible ne disparaît pas de la
      // mission simplement parce qu'elle n'était pas cochable.
      const accessibles = new Set(
        (
          await db
            .select({ id: etudes.id })
            .from(etudes)
            .where(
              and(
                inArray(
                  etudes.id,
                  lignesAvant.map((l) => l.etudeId),
                ),
                etudeAccessible(etudes.id, compte.id),
              ),
            )
        ).map((e) => e.id),
      );
      const aRetirer = lignesAvant.filter(
        (l) => accessibles.has(l.etudeId) && !choix.ids.includes(l.etudeId),
      );
      if (aRetirer.length > 0) {
        await db.delete(tacheEtudes).where(
          inArray(
            tacheEtudes.id,
            aRetirer.map((l) => l.id),
          ),
        );
      }

      const dejaLa = new Set(lignesAvant.map((l) => l.etudeId));
      const aAjouter = choix.ids.filter((e) => !dejaLa.has(e));
      if (aAjouter.length > 0) {
        await db.insert(tacheEtudes).values(
          aAjouter.map((etudeId) => ({
            tacheId: id,
            etudeId,
            // Une mission simple qui s'étend garde, pour son étude d'origine,
            // l'avancement déjà atteint.
            statut: lignesAvant.length === 0 && etudeId === avant?.etudeId ? avant.statut : "a_faire",
          })),
        );
      }

      await recalculerStatut(id);
    }

    revalidatePath("/", "layout");
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/** Une mission multi-études n'a pas de statut propre : il suit ses études. */
async function exigerMissionSimple(id: number): Promise<void> {
  const [ligne] = await db
    .select({ id: tacheEtudes.id })
    .from(tacheEtudes)
    .where(eq(tacheEtudes.tacheId, id))
    .limit(1);
  if (ligne) {
    throw new Error("Le statut de cette mission suit celui de ses études : changez-le étude par étude.");
  }
}

/** Coche / décoche une tâche depuis la liste. */
export async function basculerTache(donnees: FormData) {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Tâche manquante.");
  await exigerAcces("taches", id, compte.id);
  await exigerMissionSimple(id);

  const [tache] = await db
    .select({ statut: taches.statut })
    .from(taches)
    .where(eq(taches.id, id))
    .limit(1);
  if (!tache) throw new Error("Tâche introuvable.");

  const terminee = tache.statut === "terminee";
  await db
    .update(taches)
    .set({
      statut: terminee ? "a_faire" : "terminee",
      termineeLe: terminee ? null : maintenant(),
      modifieLe: maintenant(),
    })
    .where(eq(taches.id, id));

  revalidatePath("/", "layout");
}

/**
 * Change uniquement le statut, depuis le sélecteur en ligne du tableau.
 *
 * Prend des arguments simples plutôt qu'un FormData : React 19 réinitialise
 * automatiquement un formulaire après l'exécution de son action, ce qui
 * ramenait visuellement le sélecteur à son ancienne valeur alors que
 * l'enregistrement avait bien eu lieu.
 */
export async function definirStatutTache(id: number, statut: string) {
  const compte = await exigerSession();

  if (!id || !["a_faire", "en_cours", "terminee"].includes(statut)) {
    throw new Error("Statut de mission invalide.");
  }
  await exigerAcces("taches", id, compte.id);
  await exigerMissionSimple(id);

  await db
    .update(taches)
    .set({
      statut,
      termineeLe: statut === "terminee" ? maintenant() : null,
      modifieLe: maintenant(),
    })
    .where(eq(taches.id, id));

  revalidatePath("/", "layout");
}

/** Statut d'une étude au sein d'une mission multi-études. */
export async function definirStatutLigneMission(id: number, statut: string) {
  const compte = await exigerSession();

  if (!id || !(statut in LIBELLES_STATUT_LIGNE_MISSION)) {
    throw new Error("Statut invalide.");
  }
  await exigerAccesLigneMission(id, compte.id);

  const [ligne] = await db
    .update(tacheEtudes)
    .set({
      statut,
      termineeLe: statut === "terminee" ? maintenant() : null,
      modifieLe: maintenant(),
    })
    .where(eq(tacheEtudes.id, id))
    .returning({ tacheId: tacheEtudes.tacheId });

  if (ligne) await recalculerStatut(ligne.tacheId);
  revalidatePath("/", "layout");
}

/** Commentaire propre à une étude au sein d'une mission multi-études. */
export async function definirNoteLigneMission(id: number, notes: string) {
  const compte = await exigerSession();

  if (!id) throw new Error("Ligne manquante.");
  await exigerAccesLigneMission(id, compte.id);

  await db
    .update(tacheEtudes)
    .set({ notes: notes.trim().slice(0, 2000) || null, modifieLe: maintenant() })
    .where(eq(tacheEtudes.id, id));

  revalidatePath("/", "layout");
}

export async function supprimerTache(donnees: FormData) {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Tâche manquante.");
  await exigerAcces("taches", id, compte.id);

  // Les lignes par étude partent avec la mission (CASCADE).
  await db.delete(taches).where(eq(taches.id, id));
  revalidatePath("/", "layout");
}
