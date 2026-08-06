"use server";

import { and, eq, inArray, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { checklistItems, etudes } from "@/db/schema";
import { exigerAcces, exigerAccesChecklist } from "@/lib/acces";
import { exigerSession } from "@/lib/auth";
import { REFERENTIELS_PAR_CLE, lireReglementations } from "@/lib/referentiels";

const maintenant = () => Math.floor(Date.now() / 1000);

/**
 * Aligne les lignes de checklist d'une étude sur les référentiels cochés.
 *
 * - ajoute les items des référentiels nouvellement cochés ;
 * - retire les items des référentiels décochés, sauf ceux déjà cochés ou
 *   annotés : on ne détruit jamais un travail déjà fait sans le dire.
 *
 * Renvoie le nombre de lignes ajoutées et de lignes conservées malgré le
 * décochage, pour pouvoir en informer l'utilisateur.
 */
export async function synchroniserChecklists(
  etudeId: number,
): Promise<{ ajoutees: number; conservees: number }> {
  const [etude] = await db
    .select({ reglementations: etudes.reglementations })
    .from(etudes)
    .where(eq(etudes.id, etudeId))
    .limit(1);
  if (!etude) return { ajoutees: 0, conservees: 0 };

  const cles = lireReglementations(etude.reglementations);

  const existants = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.etudeId, etudeId));

  const dejaPresent = new Set(existants.map((i) => `${i.referentiel}::${i.itemCle}`));

  // 1. Ajouter ce qui manque.
  const aInserer: (typeof checklistItems.$inferInsert)[] = [];
  for (const cle of cles) {
    const ref = REFERENTIELS_PAR_CLE.get(cle);
    if (!ref) continue;

    ref.items.forEach((item, index) => {
      if (dejaPresent.has(`${ref.cle}::${item.cle}`)) return;
      aInserer.push({
        etudeId,
        referentiel: ref.cle,
        itemCle: item.cle,
        titre: item.titre,
        description: item.description ?? null,
        reference: item.reference ?? null,
        phase: item.phase,
        obligatoire: item.obligatoire !== false,
        ordre: index,
      });
    });
  }

  if (aInserer.length > 0) await db.insert(checklistItems).values(aInserer);

  // 2. Retirer les référentiels décochés, en épargnant le travail déjà fait.
  let conservees = 0;
  const aRetirer = existants.filter((i) => !cles.includes(i.referentiel));
  const jetables = aRetirer.filter((i) => !i.fait && !i.sansObjet && !i.notes);
  conservees = aRetirer.length - jetables.length;

  if (jetables.length > 0) {
    await db.delete(checklistItems).where(
      inArray(
        checklistItems.id,
        jetables.map((i) => i.id),
      ),
    );
  }

  return { ajoutees: aInserer.length, conservees };
}

/** Coche ou décoche une ligne de checklist. */
export async function basculerChecklist(donnees: FormData) {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Ligne manquante.");
  await exigerAccesChecklist(id, compte.id);

  const [ligne] = await db
    .select({ fait: checklistItems.fait })
    .from(checklistItems)
    .where(eq(checklistItems.id, id))
    .limit(1);
  if (!ligne) throw new Error("Ligne introuvable.");

  await db
    .update(checklistItems)
    .set({
      fait: !ligne.fait,
      faitLe: ligne.fait ? null : maintenant(),
      // Cocher une ligne lève automatiquement le « sans objet ».
      sansObjet: false,
    })
    .where(eq(checklistItems.id, id));

  revalidatePath("/", "layout");
}

/** Marque une ligne comme sans objet pour cette étude. */
export async function basculerSansObjet(donnees: FormData) {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Ligne manquante.");
  await exigerAccesChecklist(id, compte.id);

  const [ligne] = await db
    .select({ sansObjet: checklistItems.sansObjet })
    .from(checklistItems)
    .where(eq(checklistItems.id, id))
    .limit(1);
  if (!ligne) throw new Error("Ligne introuvable.");

  await db
    .update(checklistItems)
    .set({ sansObjet: !ligne.sansObjet, fait: false, faitLe: null })
    .where(eq(checklistItems.id, id));

  revalidatePath("/", "layout");
}

/** Enregistre la note associée à une ligne de checklist. */
export async function noterChecklist(entree: { id: number; notes: string }) {
  const compte = await exigerSession();
  if (!entree.id) throw new Error("Ligne manquante.");
  await exigerAccesChecklist(entree.id, compte.id);

  await db
    .update(checklistItems)
    .set({ notes: entree.notes.trim() || null })
    .where(eq(checklistItems.id, entree.id));

  revalidatePath("/", "layout");
}

/** Réinitialise un référentiel : remet les libellés à jour depuis la source. */
export async function actualiserReferentiel(donnees: FormData) {
  const compte = await exigerSession();

  const etudeId = Number(donnees.get("etudeId"));
  const cle = String(donnees.get("referentiel") ?? "");
  const ref = REFERENTIELS_PAR_CLE.get(cle);
  if (!etudeId || !ref) throw new Error("Référentiel introuvable.");
  await exigerAcces("etudes", etudeId, compte.id);

  const clesActuelles = ref.items.map((i) => i.cle);

  // Met à jour les libellés des items encore présents dans le référentiel.
  for (const [index, item] of ref.items.entries()) {
    await db
      .update(checklistItems)
      .set({
        titre: item.titre,
        description: item.description ?? null,
        reference: item.reference ?? null,
        phase: item.phase,
        obligatoire: item.obligatoire !== false,
        ordre: index,
      })
      .where(
        and(
          eq(checklistItems.etudeId, etudeId),
          eq(checklistItems.referentiel, cle),
          eq(checklistItems.itemCle, item.cle),
        ),
      );
  }

  // Supprime les items disparus du référentiel s'ils n'ont pas servi.
  if (clesActuelles.length > 0) {
    const orphelins = await db
      .select({ id: checklistItems.id, fait: checklistItems.fait, notes: checklistItems.notes })
      .from(checklistItems)
      .where(
        and(
          eq(checklistItems.etudeId, etudeId),
          eq(checklistItems.referentiel, cle),
          notInArray(checklistItems.itemCle, clesActuelles),
        ),
      );

    const jetables = orphelins.filter((o) => !o.fait && !o.notes).map((o) => o.id);
    if (jetables.length > 0) {
      await db.delete(checklistItems).where(inArray(checklistItems.id, jetables));
    }
  }

  await synchroniserChecklists(etudeId);
  revalidatePath("/", "layout");
}
