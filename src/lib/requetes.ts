import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, gte, inArray, isNull, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { db } from "@/db";
import {
  actionsCorrectives,
  checklistItems,
  conventions,
  partages,
  utilisateurs,
  documents,
  ecarts,
  etudes,
  faq,
  pages,
  sousTaches,
  taches,
  temps,
  visites,
  type SousTache,
} from "@/db/schema";
import { etudeAccessible, idsEtudesAccessibles, objetAccessible } from "./acces";
import { utilisateurActuel } from "./auth";
import { debutDeMois, debutDeSemaine } from "./format";

/** Une semaine en jours : évite un 7 magique au milieu des calculs de fenêtre. */
const SECONDES_SEMAINE_JOURS = 86400;

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

/** Étapes de plusieurs missions, en une lecture, groupées par mission. */
async function sousTachesParMission(tacheIds: number[]): Promise<Map<number, SousTache[]>> {
  const parTache = new Map<number, SousTache[]>();
  if (tacheIds.length === 0) return parTache;

  const lignes = await db
    .select()
    .from(sousTaches)
    .where(inArray(sousTaches.tacheId, tacheIds))
    .orderBy(asc(sousTaches.ordre), asc(sousTaches.id));

  for (const s of lignes) {
    const deja = parTache.get(s.tacheId);
    if (deja) deja.push(s);
    else parTache.set(s.tacheId, [s]);
  }
  return parTache;
}

export async function tachesDEtude(etudeId: number) {
  const id = await moi();
  const liste = await db
    .select()
    .from(taches)
    .where(
      and(
        eq(taches.etudeId, etudeId),
        objetAccessible(taches.proprietaireId, taches.etudeId, id),
      ),
    )
    .orderBy(asc(taches.statut), asc(taches.ordre), desc(taches.creeLe));

  const parMission = await sousTachesParMission(liste.map((t) => t.id));
  const cumul = await cumulTempsDesMissions(liste.map((t) => t.id));
  return liste.map((t) => ({
    ...t,
    ...rattacherTemps(t, parMission.get(t.id) ?? [], cumul),
  }));
}

/** Toutes les missions, avec le nom, le code et la couleur de leur étude. */
export async function toutesLesTaches(filtreStatut?: string) {
  const id = await moi();
  const lignes = await db
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

  const ids = lignes.map((l) => l.tache.id);
  const [parMission, cumul] = await Promise.all([
    sousTachesParMission(ids),
    cumulTempsDesMissions(ids),
  ]);
  return lignes.map((l) => ({
    ...l,
    ...rattacherTemps(l.tache, parMission.get(l.tache.id) ?? [], cumul),
  }));
}

type CumulTemps = {
  parTache: Map<number, number>;
  parEtape: Map<number, number>;
  chronoSousTacheId: number | null;
  chronoTacheId: number | null;
};

/** Minutes saisies (y compris un chrono en cours) pour un lot de missions. */
async function cumulTempsDesMissions(tacheIds: number[]): Promise<CumulTemps> {
  const vide: CumulTemps = {
    parTache: new Map(),
    parEtape: new Map(),
    chronoSousTacheId: null,
    chronoTacheId: null,
  };
  if (tacheIds.length === 0) return vide;

  const id = await moi();
  const lignes = await db
    .select({
      tacheId: temps.tacheId,
      sousTacheId: temps.sousTacheId,
      debut: temps.debut,
      fin: temps.fin,
    })
    .from(temps)
    .where(and(eq(temps.proprietaireId, id), inArray(temps.tacheId, tacheIds)));

  const cumul: CumulTemps = {
    parTache: new Map(),
    parEtape: new Map(),
    chronoSousTacheId: null,
    chronoTacheId: null,
  };

  for (const l of lignes) {
    if (!l.tacheId) continue;
    const minutes = dureeMinutes(l);
    cumul.parTache.set(l.tacheId, (cumul.parTache.get(l.tacheId) ?? 0) + minutes);
    if (l.sousTacheId) {
      cumul.parEtape.set(l.sousTacheId, (cumul.parEtape.get(l.sousTacheId) ?? 0) + minutes);
    }
    if (l.fin === null) {
      cumul.chronoTacheId = l.tacheId;
      cumul.chronoSousTacheId = l.sousTacheId;
    }
  }
  return cumul;
}

function rattacherTemps<T extends { id: number }>(
  tache: T,
  etapes: SousTache[],
  cumul: CumulTemps,
) {
  const minutesParEtape: Record<number, number> = {};
  for (const s of etapes) {
    minutesParEtape[s.id] = cumul.parEtape.get(s.id) ?? 0;
  }
  return {
    sousTaches: etapes,
    minutes: cumul.parTache.get(tache.id) ?? 0,
    minutesParEtape,
    chronoEnCours: cumul.chronoTacheId === tache.id,
    chronoSousTacheId:
      cumul.chronoTacheId === tache.id ? cumul.chronoSousTacheId : null,
  };
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
      etapeTitre: sousTaches.titre,
    })
    .from(temps)
    .leftJoin(etudes, eq(temps.etudeId, etudes.id))
    .leftJoin(taches, eq(temps.tacheId, taches.id))
    .leftJoin(sousTaches, eq(temps.sousTacheId, sousTaches.id))
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
      etapeTitre: sousTaches.titre,
    })
    .from(temps)
    .leftJoin(etudes, eq(temps.etudeId, etudes.id))
    .leftJoin(taches, eq(temps.tacheId, taches.id))
    .leftJoin(sousTaches, eq(temps.sousTacheId, sousTaches.id))
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

/* -------------------------------------------------------------------------- */
/*  Indicateurs                                                               */
/* -------------------------------------------------------------------------- */

/** Un point de tendance : une période, et ce qu'on y a mesuré. */
export type PointTendance = { debut: number; valeur: number };

/**
 * Minutes saisies par semaine, sur les N dernières semaines.
 *
 * L'agrégation se fait en JavaScript plutôt qu'en SQL : `strftime('%W')` de
 * SQLite ne suit pas la numérotation ISO des semaines, et un décalage d'un jour
 * en janvier fausserait la première barre.
 */
export async function tempsParSemaine(nbSemaines = 12): Promise<PointTendance[]> {
  const id = await moi();
  const maintenant = Math.floor(Date.now() / 1000);
  const premiere = debutDeSemaine(maintenant) - (nbSemaines - 1) * 7 * SECONDES_SEMAINE_JOURS;

  const lignes = await db
    .select({ debut: temps.debut, fin: temps.fin })
    .from(temps)
    .where(
      and(
        eq(temps.proprietaireId, id),
        sql`${temps.fin} is not null`,
        gte(temps.debut, premiere),
      ),
    );

  // Toutes les semaines de la fenêtre existent, même vides : un trou dans la
  // série se lit comme « aucun temps saisi », pas comme une semaine manquante.
  const paniers = new Map<number, number>();
  for (let i = 0; i < nbSemaines; i++) {
    paniers.set(premiere + i * 7 * SECONDES_SEMAINE_JOURS, 0);
  }
  for (const l of lignes) {
    const semaine = debutDeSemaine(l.debut);
    if (paniers.has(semaine)) {
      paniers.set(semaine, (paniers.get(semaine) ?? 0) + dureeMinutes(l));
    }
  }

  return [...paniers.entries()]
    .sort(([a], [b]) => a - b)
    .map(([debut, valeur]) => ({ debut, valeur }));
}

/** Missions créées et terminées, mois par mois. */
export type FluxMois = { debut: number; creees: number; terminees: number };

export async function fluxMissionsParMois(nbMois = 6): Promise<FluxMois[]> {
  const id = await moi();
  const maintenant = Math.floor(Date.now() / 1000);

  // On remonte mois par mois plutôt qu'en soustrayant 30 jours : les mois n'ont
  // pas tous la même durée, et l'écart décalerait les paniers.
  const debuts: number[] = [];
  const curseur = new Date(debutDeMois(maintenant) * 1000);
  for (let i = 0; i < nbMois; i++) {
    debuts.unshift(Math.floor(curseur.getTime() / 1000));
    curseur.setMonth(curseur.getMonth() - 1);
  }
  const premier = debuts[0];

  const lignes = await db
    .select({ creeLe: taches.creeLe, termineeLe: taches.termineeLe })
    .from(taches)
    .where(
      and(
        objetAccessible(taches.proprietaireId, taches.etudeId, id),
        sql`(${taches.creeLe} >= ${premier} or ${taches.termineeLe} >= ${premier})`,
      ),
    );

  const paniers = new Map<number, { creees: number; terminees: number }>(
    debuts.map((d) => [d, { creees: 0, terminees: 0 }]),
  );

  /** Rattache un instant au début de son mois, s'il est dans la fenêtre. */
  const panier = (instant: number | null) => {
    if (!instant) return null;
    const mois = debutDeMois(instant);
    return paniers.get(mois) ?? null;
  };

  for (const l of lignes) {
    const creation = panier(l.creeLe);
    if (creation) creation.creees += 1;
    const fin = panier(l.termineeLe);
    if (fin) fin.terminees += 1;
  }

  return debuts.map((debut) => ({ debut, ...paniers.get(debut)! }));
}

/** Avancement de chaque référentiel réglementaire, toutes études confondues. */
export async function progressionParReferentiel(): Promise<Map<string, Progression>> {
  const id = await moi();
  const lignes = await db
    .select({
      referentiel: checklistItems.referentiel,
      fait: checklistItems.fait,
      sansObjet: checklistItems.sansObjet,
    })
    .from(checklistItems)
    .where(sql`${checklistItems.etudeId} in ${idsEtudesAccessibles(id)}`);

  const parRef = new Map<string, { fait: boolean; sansObjet: boolean }[]>();
  for (const l of lignes) {
    parRef.set(l.referentiel, [...(parRef.get(l.referentiel) ?? []), l]);
  }
  return new Map([...parRef.entries()].map(([cle, l]) => [cle, progression(l)]));
}

/** Une ligne du tableau de bord par étude : l'essentiel en un coup d'œil. */
export type SyntheseEtude = {
  id: number;
  nom: string;
  code: string | null;
  couleur: string;
  statut: string;
  missionsOuvertes: number;
  missionsEnRetard: number;
  conformite: number | null;
  minutes: number;
  documents: number;
};

export async function synthesesParEtude(): Promise<SyntheseEtude[]> {
  const maintenant = Math.floor(Date.now() / 1000);

  const [etudesLues, missions, progressions, docs, tempsLu] = await Promise.all([
    listerEtudes({ avecArchivees: true }),
    toutesLesTaches(),
    progressionParEtude(),
    tousLesDocuments({}),
    entreesTemps(),
  ]);

  const compter = <T>(liste: T[], cle: (x: T) => number | null | undefined) => {
    const m = new Map<number, number>();
    for (const x of liste) {
      const k = cle(x);
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };

  const ouvertes = compter(
    missions.filter(({ tache }) => tache.statut !== "terminee"),
    ({ tache }) => tache.etudeId,
  );
  const enRetard = compter(
    missions.filter(
      ({ tache }) =>
        tache.statut !== "terminee" && tache.echeance && tache.echeance < maintenant,
    ),
    ({ tache }) => tache.etudeId,
  );
  const nbDocs = compter(docs, (d) => d.document.etudeId);

  const minutes = new Map<number, number>();
  for (const l of tempsLu) {
    const k = l.entree.etudeId;
    if (k) minutes.set(k, (minutes.get(k) ?? 0) + dureeMinutes(l.entree));
  }

  return etudesLues.map((e) => {
    const p = progressions.get(e.id);
    return {
      id: e.id,
      nom: e.nom,
      code: e.code,
      couleur: e.couleur,
      statut: e.statut,
      missionsOuvertes: ouvertes.get(e.id) ?? 0,
      missionsEnRetard: enRetard.get(e.id) ?? 0,
      conformite: p && p.total > 0 ? p.pourcentage : null,
      minutes: minutes.get(e.id) ?? 0,
      documents: nbDocs.get(e.id) ?? 0,
    };
  });
}

/** Respect des échéances : parmi les missions terminées, celles rendues à temps. */
export async function respectDesEcheances(): Promise<{
  aLHeure: number;
  enRetard: number;
  pourcentage: number | null;
}> {
  const id = await moi();
  const lignes = await db
    .select({ echeance: taches.echeance, termineeLe: taches.termineeLe })
    .from(taches)
    .where(
      and(
        objetAccessible(taches.proprietaireId, taches.etudeId, id),
        eq(taches.statut, "terminee"),
        sql`${taches.echeance} is not null`,
        sql`${taches.termineeLe} is not null`,
      ),
    );

  const aLHeure = lignes.filter((l) => (l.termineeLe ?? 0) <= (l.echeance ?? 0)).length;
  const enRetard = lignes.length - aLHeure;
  return {
    aLHeure,
    enRetard,
    pourcentage: lignes.length > 0 ? Math.round((aLHeure / lignes.length) * 100) : null,
  };
}

/* -------------------------------------------------------------------------- */
/*  Visites de monitorage                                                     */
/* -------------------------------------------------------------------------- */

/** Les visites, avec l'étude à laquelle elles se rattachent. */
export async function toutesLesVisites(filtres: { etudeId?: number | null; statut?: string } = {}) {
  const id = await moi();
  const conditions = [objetAccessible(visites.proprietaireId, visites.etudeId, id)];
  if (filtres.etudeId) conditions.push(eq(visites.etudeId, filtres.etudeId));
  if (filtres.statut) conditions.push(eq(visites.statut, filtres.statut));

  return db
    .select({
      visite: visites,
      etudeNom: etudes.nom,
      etudeCode: etudes.code,
      etudeCouleur: etudes.couleur,
    })
    .from(visites)
    .leftJoin(etudes, eq(visites.etudeId, etudes.id))
    // Les visites à venir d'abord, du plus proche au plus lointain ; celles
    // sans date prévue ferment la marche plutôt que d'ouvrir la liste.
    .where(and(...conditions))
    .orderBy(sql`${visites.datePrevue} is null`, asc(visites.datePrevue), desc(visites.creeLe));
}

export async function visitesDEtude(etudeId: number) {
  return toutesLesVisites({ etudeId });
}

/* -------------------------------------------------------------------------- */
/*  Écarts et actions correctives                                             */
/* -------------------------------------------------------------------------- */

/** Les écarts, avec leur étude et le nombre d'actions ouvertes qu'ils portent. */
export async function tousLesEcarts(
  filtres: { etudeId?: number | null; statut?: string; gravite?: string } = {},
) {
  const id = await moi();
  const conditions = [objetAccessible(ecarts.proprietaireId, ecarts.etudeId, id)];
  if (filtres.etudeId) conditions.push(eq(ecarts.etudeId, filtres.etudeId));
  if (filtres.statut) conditions.push(eq(ecarts.statut, filtres.statut));
  if (filtres.gravite) conditions.push(eq(ecarts.gravite, filtres.gravite));

  const lignes = await db
    .select({
      ecart: ecarts,
      etudeNom: etudes.nom,
      etudeCode: etudes.code,
      etudeCouleur: etudes.couleur,
    })
    .from(ecarts)
    .leftJoin(etudes, eq(ecarts.etudeId, etudes.id))
    .where(and(...conditions))
    // Les plus graves d'abord, puis les plus récents : c'est l'ordre dans
    // lequel on veut les traiter, pas l'ordre de saisie.
    .orderBy(
      sql`case ${ecarts.gravite} when 'critique' then 0 when 'majeur' then 1 else 2 end`,
      desc(ecarts.dateConstat),
      desc(ecarts.creeLe),
    );

  // Compte des actions non closes, pour signaler un écart clos qui traîne
  // encore des actions ouvertes.
  const compteurs = await db
    .select({
      ecartId: actionsCorrectives.ecartId,
      ouvertes: sql<number>`sum(case when ${actionsCorrectives.statut} in ('a_faire','en_cours','faite') then 1 else 0 end)`,
      total: sql<number>`count(*)`,
    })
    .from(actionsCorrectives)
    .where(objetAccessible(actionsCorrectives.proprietaireId, actionsCorrectives.etudeId, id))
    .groupBy(actionsCorrectives.ecartId);

  const parEcart = new Map(compteurs.map((c) => [c.ecartId, c]));

  return lignes.map((l) => ({
    ...l,
    actionsOuvertes: parEcart.get(l.ecart.id)?.ouvertes ?? 0,
    actionsTotal: parEcart.get(l.ecart.id)?.total ?? 0,
  }));
}

/** Les actions correctives, avec leur étude et l'écart dont elles découlent. */
export async function toutesLesActions(
  filtres: { etudeId?: number | null; statut?: string; ecartId?: number | null } = {},
) {
  const id = await moi();
  const conditions = [
    objetAccessible(actionsCorrectives.proprietaireId, actionsCorrectives.etudeId, id),
  ];
  if (filtres.etudeId) conditions.push(eq(actionsCorrectives.etudeId, filtres.etudeId));
  if (filtres.statut) conditions.push(eq(actionsCorrectives.statut, filtres.statut));
  if (filtres.ecartId) conditions.push(eq(actionsCorrectives.ecartId, filtres.ecartId));

  return db
    .select({
      action: actionsCorrectives,
      etudeNom: etudes.nom,
      etudeCode: etudes.code,
      etudeCouleur: etudes.couleur,
      ecartTitre: ecarts.titre,
      ecartReference: ecarts.reference,
    })
    .from(actionsCorrectives)
    .leftJoin(etudes, eq(actionsCorrectives.etudeId, etudes.id))
    .leftJoin(ecarts, eq(actionsCorrectives.ecartId, ecarts.id))
    .where(and(...conditions))
    // Les échéances les plus proches d'abord ; celles sans date ferment la marche.
    .orderBy(
      sql`${actionsCorrectives.echeance} is null`,
      asc(actionsCorrectives.echeance),
      desc(actionsCorrectives.creeLe),
    );
}

/** Écarts accessibles, en version courte : sert à les proposer dans un menu. */
export async function ecartsPourChoix() {
  const id = await moi();
  return db
    .select({ id: ecarts.id, titre: ecarts.titre, reference: ecarts.reference })
    .from(ecarts)
    .where(objetAccessible(ecarts.proprietaireId, ecarts.etudeId, id))
    .orderBy(desc(ecarts.creeLe));
}

/** Visites accessibles, en version courte : sert à rattacher un écart. */
export async function visitesPourChoix() {
  const id = await moi();
  return db
    .select({ id: visites.id, type: visites.type, centre: visites.centre, date: visites.datePrevue })
    .from(visites)
    .where(objetAccessible(visites.proprietaireId, visites.etudeId, id))
    .orderBy(desc(visites.datePrevue));
}

/* -------------------------------------------------------------------------- */
/*  Portefeuille et charge d'équipe                                           */
/* -------------------------------------------------------------------------- */

/** Ce qui est en cours sur une étude, côté monitorage. */
export type SuiviMonitorage = {
  visitesOuvertes: number;
  visitesEnRetard: number;
  ecartsOuverts: number;
  ecartsCritiques: number;
  actionsOuvertes: number;
  actionsEnRetard: number;
};

/** Le monitorage en cours, étude par étude. */
export async function monitorageParEtude(): Promise<Map<number, SuiviMonitorage>> {
  const id = await moi();
  const maintenant = Math.floor(Date.now() / 1000);

  const [v, e, a] = await Promise.all([
    db
      .select({ etudeId: visites.etudeId, statut: visites.statut, datePrevue: visites.datePrevue, dateRealisee: visites.dateRealisee })
      .from(visites)
      .where(objetAccessible(visites.proprietaireId, visites.etudeId, id)),
    db
      .select({ etudeId: ecarts.etudeId, statut: ecarts.statut, gravite: ecarts.gravite })
      .from(ecarts)
      .where(objetAccessible(ecarts.proprietaireId, ecarts.etudeId, id)),
    db
      .select({ etudeId: actionsCorrectives.etudeId, statut: actionsCorrectives.statut, echeance: actionsCorrectives.echeance })
      .from(actionsCorrectives)
      .where(objetAccessible(actionsCorrectives.proprietaireId, actionsCorrectives.etudeId, id)),
  ]);

  const parEtude = new Map<number, SuiviMonitorage>();
  const pour = (etudeId: number | null) => {
    if (!etudeId) return null;
    if (!parEtude.has(etudeId)) {
      parEtude.set(etudeId, {
        visitesOuvertes: 0,
        visitesEnRetard: 0,
        ecartsOuverts: 0,
        ecartsCritiques: 0,
        actionsOuvertes: 0,
        actionsEnRetard: 0,
      });
    }
    return parEtude.get(etudeId)!;
  };

  const VISITES_OUVERTES = ["planifiee", "realisee", "rapport_redige", "lettre_envoyee"];
  for (const l of v) {
    const c = pour(l.etudeId);
    if (!c || !VISITES_OUVERTES.includes(l.statut)) continue;
    c.visitesOuvertes += 1;
    if (l.datePrevue && l.datePrevue < maintenant && !l.dateRealisee) c.visitesEnRetard += 1;
  }
  for (const l of e) {
    const c = pour(l.etudeId);
    if (!c || l.statut === "clos") continue;
    c.ecartsOuverts += 1;
    if (l.gravite === "critique") c.ecartsCritiques += 1;
  }
  const ACTIONS_OUVERTES = ["a_faire", "en_cours", "faite"];
  for (const l of a) {
    const c = pour(l.etudeId);
    if (!c || !ACTIONS_OUVERTES.includes(l.statut)) continue;
    c.actionsOuvertes += 1;
    if (l.echeance && l.echeance < maintenant) c.actionsEnRetard += 1;
  }

  return parEtude;
}

export type ChargePersonne = {
  utilisateurId: number;
  nom: string;
  minutes: number;
  /** Répartition de son temps entre les études, la plus chargée d'abord. */
  parEtude: { etudeId: number; nom: string; couleur: string; minutes: number }[];
};

/**
 * Charge de chacun, sur les seules études **dont on est propriétaire**.
 *
 * Être convié sur une étude ne donne pas à voir le temps des autres : c'est
 * une information de pilotage, elle revient à qui porte l'étude. Et seuls des
 * totaux sont rendus, jamais le détail des saisies.
 */
export async function chargeEquipe(): Promise<ChargePersonne[]> {
  const id = await moi();

  const lignes = await db
    .select({
      utilisateurId: temps.proprietaireId,
      nom: utilisateurs.nom,
      etudeId: etudes.id,
      etudeNom: etudes.nom,
      etudeCouleur: etudes.couleur,
      debut: temps.debut,
      fin: temps.fin,
    })
    .from(temps)
    .innerJoin(etudes, eq(temps.etudeId, etudes.id))
    .leftJoin(utilisateurs, eq(temps.proprietaireId, utilisateurs.id))
    .where(and(eq(etudes.proprietaireId, id), sql`${temps.fin} is not null`));

  const parPersonne = new Map<number, ChargePersonne>();
  for (const l of lignes) {
    if (!l.utilisateurId) continue;
    const minutes = dureeMinutes(l);

    if (!parPersonne.has(l.utilisateurId)) {
      parPersonne.set(l.utilisateurId, {
        utilisateurId: l.utilisateurId,
        nom: l.nom ?? "Compte supprimé",
        minutes: 0,
        parEtude: [],
      });
    }
    const p = parPersonne.get(l.utilisateurId)!;
    p.minutes += minutes;

    const dejaLa = p.parEtude.find((x) => x.etudeId === l.etudeId);
    if (dejaLa) dejaLa.minutes += minutes;
    else
      p.parEtude.push({
        etudeId: l.etudeId,
        nom: l.etudeNom,
        couleur: l.etudeCouleur,
        minutes,
      });
  }

  return [...parPersonne.values()]
    .map((p) => ({ ...p, parEtude: p.parEtude.sort((a, b) => b.minutes - a.minutes) }))
    .sort((a, b) => b.minutes - a.minutes);
}

/** Qui a été convié sur quoi, parmi les études dont on est propriétaire. */
export async function equipeParEtude(): Promise<Map<number, { nom: string; niveau: string }[]>> {
  const id = await moi();

  const lignes = await db
    .select({
      etudeId: partages.ressourceId,
      niveau: partages.niveau,
      nom: utilisateurs.nom,
    })
    .from(partages)
    .innerJoin(etudes, eq(partages.ressourceId, etudes.id))
    .innerJoin(utilisateurs, eq(partages.utilisateurId, utilisateurs.id))
    .where(and(eq(partages.type, "etude"), eq(etudes.proprietaireId, id)))
    .orderBy(utilisateurs.nom);

  const parEtude = new Map<number, { nom: string; niveau: string }[]>();
  for (const l of lignes) {
    parEtude.set(l.etudeId, [...(parEtude.get(l.etudeId) ?? []), { nom: l.nom, niveau: l.niveau }]);
  }
  return parEtude;
}

/* -------------------------------------------------------------------------- */
/*  Conventions et budget                                                     */
/* -------------------------------------------------------------------------- */

/** Les conventions, avec leur étude et le nom de la convention parente. */
export async function toutesLesConventions(
  filtres: { etudeId?: number | null; statut?: string } = {},
) {
  const id = await moi();
  const conditions = [objetAccessible(conventions.proprietaireId, conventions.etudeId, id)];
  if (filtres.etudeId) conditions.push(eq(conventions.etudeId, filtres.etudeId));
  if (filtres.statut) conditions.push(eq(conventions.statut, filtres.statut));

  const parent = alias(conventions, "parent");

  return db
    .select({
      convention: conventions,
      etudeNom: etudes.nom,
      etudeCode: etudes.code,
      etudeCouleur: etudes.couleur,
      parentReference: parent.reference,
      parentType: parent.type,
    })
    .from(conventions)
    .leftJoin(etudes, eq(conventions.etudeId, etudes.id))
    .leftJoin(parent, eq(conventions.parentId, parent.id))
    .where(and(...conditions))
    // Les échéances les plus proches d'abord ; celles sans date ferment la marche.
    .orderBy(
      sql`${conventions.dateEcheance} is null`,
      asc(conventions.dateEcheance),
      desc(conventions.creeLe),
    );
}

/** Conventions accessibles, en version courte : sert à rattacher un avenant. */
export async function conventionsPourChoix() {
  const id = await moi();
  return db
    .select({
      id: conventions.id,
      type: conventions.type,
      reference: conventions.reference,
      partie: conventions.partie,
    })
    .from(conventions)
    .where(objetAccessible(conventions.proprietaireId, conventions.etudeId, id))
    .orderBy(desc(conventions.creeLe));
}
