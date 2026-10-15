import "server-only";
import { and, eq, inArray, isNotNull, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { etudes, taches, tachesEtudes, utilisateurs } from "@/db/schema";
import { lireCompteSmtp } from "./courrier";
import { envoyerCourrier } from "./envoyer-courrier";
import { debutDeJour } from "./format";
import { rappelsAEnvoyer, redigerRappel } from "./rappels";
import { SITE_URL } from "./site";
import { lienTimeline } from "./timeline";

/** Les rappels partent à partir de cette heure (heure du serveur), pas en pleine nuit. */
const HEURE_ENVOI = 7;
const INTERVALLE_MS = 60 * 60 * 1000;

let enCours = false;

/**
 * Envoie les rappels dus. Un rappel n'est marqué envoyé qu'une fois le
 * courrier parti : un échec réseau sera retenté au passage suivant.
 */
export async function envoyerRappelsDus(maintenant = new Date()): Promise<number> {
  if (enCours || !lireCompteSmtp()) return 0;
  if (maintenant.getHours() < HEURE_ENVOI) return 0;
  enCours = true;
  try {
    const aujourdhui = debutDeJour(Math.floor(maintenant.getTime() / 1000));
    // Destinataire : la personne à qui la mission est attribuée, sinon son auteur.
    const destinataireId = sql<number>`coalesce(${taches.assigneA}, ${taches.proprietaireId})`;

    const candidates = db
      .select({
        id: taches.id,
        titre: taches.titre,
        notes: taches.notes,
        statut: taches.statut,
        archiveeLe: taches.archiveeLe,
        echeance: taches.echeance,
        etudeId: taches.etudeId,
        rappelLe: taches.rappelLe,
        rappelEnvoyeLe: taches.rappelEnvoyeLe,
        rappelEcheanceEnvoyeLe: taches.rappelEcheanceEnvoyeLe,
        rappelJours: utilisateurs.rappelJours,
        nom: utilisateurs.nom,
        email: utilisateurs.email,
      })
      .from(taches)
      .innerJoin(utilisateurs, eq(utilisateurs.id, destinataireId))
      .where(
        and(
          ne(taches.statut, "terminee"),
          isNull(taches.archiveeLe),
          eq(utilisateurs.actif, true),
          or(
            and(isNotNull(taches.rappelLe), isNull(taches.rappelEnvoyeLe)),
            and(isNotNull(taches.echeance), isNull(taches.rappelEcheanceEnvoyeLe)),
          ),
        ),
      )
      .all();

    let envoyes = 0;
    for (const m of candidates) {
      const genres = rappelsAEnvoyer(m, aujourdhui);
      if (genres.length === 0) continue;

      const liees = db
        .select({ id: etudes.id, nom: etudes.nom, code: etudes.code })
        .from(tachesEtudes)
        .innerJoin(etudes, eq(etudes.id, tachesEtudes.etudeId))
        .where(eq(tachesEtudes.tacheId, m.id))
        .all();
      const etudesMission =
        liees.length > 0
          ? liees
          : m.etudeId
            ? db
                .select({ id: etudes.id, nom: etudes.nom, code: etudes.code })
                .from(etudes)
                .where(inArray(etudes.id, [m.etudeId]))
                .all()
            : [];

      const { sujet, texte } = redigerRappel({
        destinataireNom: m.nom,
        titre: m.titre,
        echeance: m.echeance,
        etudes: etudesMission,
        notes: m.notes,
        href: `${SITE_URL}${lienTimeline(etudesMission.map((e) => e.id))}`,
        aujourdhui,
      });

      const envoi = await envoyerCourrier({ a: m.email, sujet, texte });
      if (!envoi.ok) continue;
      envoyes++;

      // Le rappel choisi le jour où tombe aussi le rappel d'échéance couvre les deux.
      const instant = Math.floor(Date.now() / 1000);
      const rappelEcheanceAussi = rappelsAEnvoyer({ ...m, rappelLe: null }, aujourdhui).length > 0;
      db.update(taches)
        .set({
          ...(genres.includes("choisi") ? { rappelEnvoyeLe: instant } : {}),
          ...(genres.includes("echeance") || rappelEcheanceAussi
            ? { rappelEcheanceEnvoyeLe: instant }
            : {}),
        })
        .where(eq(taches.id, m.id))
        .run();
    }
    if (envoyes > 0) console.log(`Rappels : ${envoyes} courrier(s) envoyé(s).`);
    return envoyes;
  } catch (e) {
    console.error("Rappels :", e instanceof Error ? e.message : e);
    return 0;
  } finally {
    enCours = false;
  }
}

/** Passe une première fois peu après le démarrage, puis toutes les heures. */
export function demarrerRappels(): void {
  setTimeout(() => void envoyerRappelsDus(), 60_000);
  setInterval(() => void envoyerRappelsDus(), INTERVALLE_MS);
}
