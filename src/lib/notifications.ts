import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";

type NouvelleNotification = {
  utilisateurId: number;
  type: string;
  titre: string;
  message?: string;
  lien?: string;
  objetType?: string;
  objetId?: number;
};

/**
 * Crée une notification si une notification non lue du même objet n'existe
 * pas déjà — évite de spammer à chaque rechargement du tableau de bord.
 */
export function notifier(entree: NouvelleNotification): void {
  if (entree.objetType && entree.objetId != null) {
    const existante = db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.utilisateurId, entree.utilisateurId),
          eq(notifications.type, entree.type),
          eq(notifications.objetType, entree.objetType),
          eq(notifications.objetId, entree.objetId),
          eq(notifications.lu, false),
        ),
      )
      .get();
    if (existante) return;
  }

  db.insert(notifications)
    .values({
      utilisateurId: entree.utilisateurId,
      type: entree.type,
      titre: entree.titre,
      message: entree.message ?? null,
      lien: entree.lien ?? null,
      objetType: entree.objetType ?? null,
      objetId: entree.objetId ?? null,
    })
    .run();
}

export function marquerNotificationLue(id: number, utilisateurId: number): void {
  db.update(notifications)
    .set({ lu: true })
    .where(and(eq(notifications.id, id), eq(notifications.utilisateurId, utilisateurId)))
    .run();
}

export function marquerToutesLues(utilisateurId: number): void {
  db.update(notifications)
    .set({ lu: true })
    .where(and(eq(notifications.utilisateurId, utilisateurId), eq(notifications.lu, false)))
    .run();
}
