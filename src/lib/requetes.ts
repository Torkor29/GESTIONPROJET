import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { checklistItems, documents, etudes, faq, pages, taches, temps } from "@/db/schema";
import { etudeAccessible, idsEtudesAccessibles, objetAccessible } from "./acces";
import { utilisateurActuel } from "./auth";
import { debutDeMois, debutDeSemaine } from "./format";

/**
 * Identifiant de la personne connectée.
 *
 * Lu ici plutôt que passé en paramètre à chacune des vingt lectures : il n'y
 * aurait alors aucune garantie qu'un appel ne l'oublie, et un oubli ferait
 * fuiter les données d'un compte vers un autre. `cache` le mémorise pour la
 * durée de la requête, la session n'est donc lue qu'une fois.
 */
const moi = cache(async (): Promise<number> => {
  const compte = await utilisateurActuel();
  if (!compte) throw new Error("Session expirée. Reconnectez-vous.");
  return compte.id;
});

/** Minutes écoulées d'une entrée de temps ; un chrono en cours compte jusqu'à maintenant. */
export function dureeMinutes(entree: { debut: number; fin: number | null }): number {
  const fin = entree.fin ?? Math.floor(Date.now() / 1000);
  return Math.max(0, Math.round((fin - entree.debut) / 60));
}

export async function listerEtudes(options: { avecArchivees?: boolean } = {}) {
  const id = await moi();
  return db
    .select()
    .from(etudes)
    .where(
      and(
        etudeAccessible(etudes.id, id),
        options.avecArchivees ? undefined : sql`${etudes.statut} != 'archivee'`,
      ),
    )
    .orderBy(asc(etudes.statut), desc(etudes.modifieLe));
}

export async function etudeParId(id: number) {
  const utilisateur = await moi();
  const [ligne] = await db
    .select()
    .from(etudes)
    .where(and(eq(etudes.id, id), etudeAccessible(etudes.id, utilisateur)))
    .limit(1);
  return ligne ?? null;
}

export async function pagesDEtude(etudeId: number) {
  const id = await moi();
  return db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.etudeId, etudeId),
        objetAccessible(pages.proprietaireId, pages.etudeId, id),
      ),
    )
    .orderBy(asc(pages.ordre), asc(pages.id));
}

export async function pagesLibres() {
  const id = await moi();
  // Une page sans étude n'appartient qu'à son auteur : rien ne la rattache à
  // un partage.
  return db
    .select()
    .from(pages)
    .where(and(isNull(pages.etudeId), eq(pages.proprietaireId, id)))
    .orderBy(asc(pages.ordre), asc(pages.id));
}

export async function pageParId(id: number) {
  const utilisateur = await moi();
  const [ligne] = await db
    .select()
    .from(pages)
    .where(
      and(eq(pages.id, id), objetAccessible(pages.proprietaireId, pages.etudeId, utilisateur)),
    )
    .limit(1);
  return ligne ?? null;
}

export async function tachesDEtude(etudeId: number) {
  const id = await moi();
  return db
    .select()
    .from(taches)
    .where(
      and(
        eq(taches.etudeId, etudeId),
        objetAccessible(taches.proprietaireId, taches.etudeId, id),
      ),
    )
    .orderBy(asc(taches.statut), asc(taches.ordre), desc(taches.creeLe));
}

/** Toutes les missions, avec le nom, le code et la couleur de leur étude. */
export async function toutesLesTaches(filtreStatut?: string) {
  const id = await moi();
  return db
    .select({
      tache: taches,
      etudeNom: etudes.nom,
      etudeCode: etudes.code,
      etudeCouleur: etudes.couleur,
    })
    .from(taches)
    .leftJoin(etudes, eq(taches.etudeId, etudes.id))
    .where(
      and(
        objetAccessible(taches.proprietaireId, taches.etudeId, id),
        filtreStatut ? eq(taches.statut, filtreStatut) : undefined,
      ),
    )
    .orderBy(asc(taches.statut), asc(taches.echeance), desc(taches.creeLe));
}

// ------------------------------------------------------------- Documents

export async function documentsDEtude(etudeId: number) {
  const id = await moi();
  return db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.etudeId, etudeId),
        objetAccessible(documents.proprietaireId, documents.etudeId, id),
      ),
    )
    .orderBy(asc(documents.categorie), desc(documents.creeLe));
}

/** Tous les documents, avec leur étude, filtrables par étude et catégorie. */
export async function tousLesDocuments(filtres: { etudeId?: number | null; categorie?: string }) {
  const id = await moi();
  const conditions = [objetAccessible(documents.proprietaireId, documents.etudeId, id)];
  if (filtres.etudeId) conditions.push(eq(documents.etudeId, filtres.etudeId));
  if (filtres.categorie) conditions.push(eq(documents.categorie, filtres.categorie));

  return db
    .select({
      document: documents,
      etudeNom: etudes.nom,
      etudeCode: etudes.code,
      etudeCouleur: etudes.couleur,
    })
    .from(documents)
    .leftJoin(etudes, eq(documents.etudeId, etudes.id))
    .where(and(...conditions))
    .orderBy(desc(documents.creeLe));
}

// ------------------------------------------------------------ Checklists

export async function checklistDEtude(etudeId: number) {
  const id = await moi();
  return db
    .select()
    .from(checklistItems)
    .where(
      and(
        eq(checklistItems.etudeId, etudeId),
        sql`${checklistItems.etudeId} in ${idsEtudesAccessibles(id)}`,
      ),
    )
    .orderBy(asc(checklistItems.referentiel), asc(checklistItems.ordre));
}

export type Progression = { total: number; faits: number; sansObjet: number; pourcentage: number };

/**
 * Progression d'une checklist : les lignes « sans objet » sortent du
 * dénominateur, elles ne doivent ni compter comme faites ni comme en retard.
 */
export function progression(lignes: { fait: boolean; sansObjet: boolean }[]): Progression {
  const sansObjet = lignes.filter((l) => l.sansObjet).length;
  const total = lignes.length - sansObjet;
  const faits = lignes.filter((l) => l.fait && !l.sansObjet).length;
  return {
    total,
    faits,
    sansObjet,
    pourcentage: total === 0 ? 0 : Math.round((faits / total) * 100),
  };
}

/** Progression réglementaire de chaque étude, pour le tableau de bord. */
export async function progressionParEtude() {
  const id = await moi();
  const lignes = await db
    .select({
      etudeId: checklistItems.etudeId,
      fait: checklistItems.fait,
      sansObjet: checklistItems.sansObjet,
    })
    .from(checklistItems)
    .where(sql`${checklistItems.etudeId} in ${idsEtudesAccessibles(id)}`);

  const parEtude = new Map<number, { fait: boolean; sansObjet: boolean }[]>();
  for (const l of lignes) {
    parEtude.set(l.etudeId, [...(parEtude.get(l.etudeId) ?? []), l]);
  }

  return new Map([...parEtude.entries()].map(([id, l]) => [id, progression(l)]));
}

// -------------------------------------------------------------------- FAQ

export async function entreesFaq(filtres: { etudeId?: number | null; portee?: string } = {}) {
  const id = await moi();
  const conditions = [objetAccessible(faq.proprietaireId, faq.etudeId, id)];
  if (filtres.portee === "generale") conditions.push(isNull(faq.etudeId));
  else if (filtres.etudeId) conditions.push(eq(faq.etudeId, filtres.etudeId));

  return db
    .select({
      entree: faq,
      etudeNom: etudes.nom,
      etudeCode: etudes.code,
      etudeCouleur: etudes.couleur,
    })
    .from(faq)
    .leftJoin(etudes, eq(faq.etudeId, etudes.id))
    .where(and(...conditions))
    .orderBy(asc(faq.categorie), asc(faq.ordre), desc(faq.creeLe));
}

export async function faqDEtude(etudeId: number) {
  const id = await moi();
  return db
    .select()
    .from(faq)
    .where(and(eq(faq.etudeId, etudeId), objetAccessible(faq.proprietaireId, faq.etudeId, id)))
    .orderBy(asc(faq.ordre));
}

/**
 * Le chronomètre en cours, s'il y en a un. Un seul peut tourner à la fois —
 * et il est propre à chacun : partager une étude ne fait pas apparaître le
 * chronomètre d'un collègue.
 */
export async function chronoEnCours() {
  const id = await moi();
  const [ligne] = await db
    .select({
      entree: temps,
      etudeNom: etudes.nom,
      etudeCouleur: etudes.couleur,
      tacheTitre: taches.titre,
    })
    .from(temps)
    .leftJoin(etudes, eq(temps.etudeId, etudes.id))
    .leftJoin(taches, eq(temps.tacheId, taches.id))
    .where(and(isNull(temps.fin), eq(temps.proprietaireId, id)))
    .orderBy(desc(temps.debut))
    .limit(1);
  return ligne ?? null;
}

export type FiltresTemps = {
  du?: number | null;
  au?: number | null;
  etudeId?: number | null;
};

/**
 * Entrées de temps terminées, filtrées par période et par étude.
 *
 * Le temps reste personnel, même sur une étude partagée : chacun ne voit que
 * ses propres saisies. Le cumul par équipe relèvera du module « portefeuille
 * et charge d'équipe ».
 */
export async function entreesTemps(filtres: FiltresTemps = {}) {
  const id = await moi();
  const conditions = [sql`${temps.fin} is not null`, eq(temps.proprietaireId, id)];
  if (filtres.du) conditions.push(gte(temps.debut, filtres.du));
  if (filtres.au) conditions.push(lt(temps.debut, filtres.au));
  if (filtres.etudeId) conditions.push(eq(temps.etudeId, filtres.etudeId));

  return db
    .select({
      entree: temps,
      etudeNom: etudes.nom,
      etudeCouleur: etudes.couleur,
      etudeClient: etudes.client,
      etudeTarif: etudes.tarifHoraire,
      tacheTitre: taches.titre,
    })
    .from(temps)
    .leftJoin(etudes, eq(temps.etudeId, etudes.id))
    .leftJoin(taches, eq(temps.tacheId, taches.id))
    .where(and(...conditions))
    .orderBy(desc(temps.debut));
}

/** Total de minutes saisies depuis un instant donné. */
async function minutesDepuis(depuis: number): Promise<number> {
  const id = await moi();
  const lignes = await db
    .select({ debut: temps.debut, fin: temps.fin })
    .from(temps)
    .where(
      and(gte(temps.debut, depuis), sql`${temps.fin} is not null`, eq(temps.proprietaireId, id)),
    );
  return lignes.reduce((total, l) => total + dureeMinutes(l), 0);
}

/** Chiffres du tableau de bord. */
export async function statistiques() {
  const id = await moi();
  const maintenant = Math.floor(Date.now() / 1000);

  const [minutesSemaine, minutesMois] = await Promise.all([
    minutesDepuis(debutDeSemaine(maintenant)),
    minutesDepuis(debutDeMois(maintenant)),
  ]);

  const [{ n: etudesActives }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(etudes)
    .where(and(eq(etudes.statut, "active"), etudeAccessible(etudes.id, id)));

  const accessibles = objetAccessible(taches.proprietaireId, taches.etudeId, id);

  const [{ n: tachesOuvertes }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(taches)
    .where(and(sql`${taches.statut} != 'terminee'`, accessibles));

  const [{ n: tachesEnRetard }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(taches)
    .where(
      and(
        sql`${taches.statut} != 'terminee'`,
        sql`${taches.echeance} is not null`,
        lt(taches.echeance, maintenant),
        accessibles,
      ),
    );

  return { minutesSemaine, minutesMois, etudesActives, tachesOuvertes, tachesEnRetard };
}

/** Temps total par étude sur une période, pour le récapitulatif. */
export async function totauxParEtude(filtres: FiltresTemps = {}) {
  const lignes = await entreesTemps(filtres);
  const parEtude = new Map<
    number,
    { nom: string; couleur: string; tarif: number | null; minutes: number }
  >();

  for (const l of lignes) {
    const id = l.entree.etudeId ?? 0;
    const courant = parEtude.get(id) ?? {
      nom: l.etudeNom ?? "Sans étude",
      couleur: l.etudeCouleur ?? "#a8a29e",
      tarif: l.etudeTarif ?? null,
      minutes: 0,
    };
    courant.minutes += dureeMinutes(l.entree);
    parEtude.set(id, courant);
  }

  return [...parEtude.entries()]
    .map(([id, v]) => ({ etudeId: id, ...v }))
    .sort((a, b) => b.minutes - a.minutes);
}
