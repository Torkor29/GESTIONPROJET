/**
 * Fin d'inclusion prévue : seuils du rappel sur le tableau de bord.
 *
 * Affiché seulement sous 5 mois.
 * Moins de 3 mois (ou déjà dépassée) → rouge.
 * Moins de 4 mois → jaune.
 *
 * Les mois sont calendaires (8 septembre + 3 mois = 8 décembre),
 * pas 90 jours glissants.
 */

/** Au-delà, le rappel n'encombre pas le tableau de bord. */
export const SEUIL_AFFICHAGE_MOIS = 5;

import { formaterDate, versChampDate } from "./format";

export type NiveauInclusion = "rouge" | "jaune" | "ok" | "absent";

export function isoDateLocale(d = new Date()): string {
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mois}-${jour}`;
}

/** Ajoute `n` mois calendaires à une date ISO `YYYY-MM-DD`. */
export function ajouterMois(iso: string, n: number): string {
  const [annee, mois, jour] = iso.split("-").map(Number);
  const cible = new Date(annee, mois - 1 + n, 1);
  const dernier = new Date(cible.getFullYear(), cible.getMonth() + 1, 0).getDate();
  const jourRetenu = Math.min(jour, dernier);
  const res = new Date(cible.getFullYear(), cible.getMonth(), jourRetenu);
  return isoDateLocale(res);
}

function joursEntre(debutIso: string, finIso: string): number {
  const [ay, am, ad] = debutIso.split("-").map(Number);
  const [by, bm, bd] = finIso.split("-").map(Number);
  const debut = new Date(ay, am - 1, ad);
  const fin = new Date(by, bm - 1, bd);
  return Math.round((fin.getTime() - debut.getTime()) / 86_400_000);
}

function moisCompletsPuisJours(debutIso: string, finIso: string): { mois: number; jours: number } {
  let mois = 0;
  while (ajouterMois(debutIso, mois + 1) <= finIso) {
    mois += 1;
  }
  const apres = ajouterMois(debutIso, mois);
  return { mois, jours: joursEntre(apres, finIso) };
}

function libelleMoisJours(mois: number, jours: number): string {
  const partieMois = mois === 1 ? "1 mois" : `${mois} mois`;
  if (mois === 0) {
    if (jours <= 1) return jours === 1 ? "1 jour" : "0 jour";
    return `${jours} jours`;
  }
  if (jours === 0) return partieMois;
  if (jours === 1) return `${partieMois} et 1 jour`;
  return `${partieMois} et ${jours} jours`;
}

/** Vrai si la date tombe strictement avant aujourd'hui + `mois` calendaires. */
export function delaiSousMois(
  dateFinInclusion: number,
  mois: number,
  aujourdHui: Date = new Date(),
): boolean {
  return versChampDate(dateFinInclusion) < ajouterMois(isoDateLocale(aujourdHui), mois);
}

export function niveauFinInclusion(
  dateFinInclusion: number | null | undefined,
  aujourdHui: Date = new Date(),
): NiveauInclusion {
  if (!dateFinInclusion) return "absent";
  if (delaiSousMois(dateFinInclusion, 3, aujourdHui)) return "rouge";
  if (delaiSousMois(dateFinInclusion, 4, aujourdHui)) return "jaune";
  return "ok";
}

export function libelleDelaiInclusion(
  dateFinInclusion: number,
  aujourdHui: Date = new Date(),
): string {
  const fin = versChampDate(dateFinInclusion);
  const auj = isoDateLocale(aujourdHui);
  const date = formaterDate(dateFinInclusion);

  if (fin === auj) return `${date} · dernier jour`;
  if (fin < auj) {
    const { mois, jours } = moisCompletsPuisJours(fin, auj);
    return `dépassée depuis ${libelleMoisJours(mois, jours)} · ${date}`;
  }

  const { mois, jours } = moisCompletsPuisJours(auj, fin);
  if (mois === 0 && jours === 1) return `${date} · demain`;
  return `${date} · encore ${libelleMoisJours(mois, jours)}`;
}

export type LigneInclusion = {
  id: number;
  nom: string;
  code: string | null;
  statut: string;
  dateFinInclusion: number | null;
  niveau: NiveauInclusion;
  delai: string;
};

const ORDRE_NIVEAU: Record<NiveauInclusion, number> = {
  rouge: 0,
  jaune: 1,
  absent: 2,
  ok: 3,
};

/**
 * Études encore ouvertes dont la fin d'inclusion tombe dans moins de
 * 5 mois — assez pour anticiper une MS, sans lister tout le portefeuille.
 */
export function lignesRappelInclusion(
  etudes: {
    id: number;
    nom: string;
    code: string | null;
    statut: string;
    dateFinInclusion: number | null;
  }[],
  aujourdHui: Date = new Date(),
): LigneInclusion[] {
  return etudes
    .filter((e) => e.statut === "active" || e.statut === "en_pause")
    .filter(
      (e) =>
        e.dateFinInclusion != null &&
        delaiSousMois(e.dateFinInclusion, SEUIL_AFFICHAGE_MOIS, aujourdHui),
    )
    .map((e) => ({
      ...e,
      niveau: niveauFinInclusion(e.dateFinInclusion, aujourdHui),
      delai: formaterDate(e.dateFinInclusion),
    }))
    .sort((a, b) => {
      const parNiveau = ORDRE_NIVEAU[a.niveau] - ORDRE_NIVEAU[b.niveau];
      if (parNiveau !== 0) return parNiveau;
      return (a.dateFinInclusion ?? 0) - (b.dateFinInclusion ?? 0);
    });
}
