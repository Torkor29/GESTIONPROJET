/** Helpers d'affichage : dates, durées, montants. Tout est en français. */

export const SECONDES_PAR_JOUR = 86400;

/** Secondes Unix -> "04/08/2026" */
export function formaterDate(secondes: number | null | undefined): string {
  if (!secondes) return "—";
  return new Date(secondes * 1000).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Secondes Unix -> "04/08/2026 à 14:30" */
export function formaterDateHeure(secondes: number | null | undefined): string {
  if (!secondes) return "—";
  return new Date(secondes * 1000).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Secondes Unix -> "14:30" */
export function formaterHeure(secondes: number | null | undefined): string {
  if (!secondes) return "—";
  return new Date(secondes * 1000).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Secondes Unix -> "2026-08-04", le format attendu par <input type="date">. */
export function versChampDate(secondes: number | null | undefined): string {
  if (!secondes) return "";
  const d = new Date(secondes * 1000);
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mois}-${jour}`;
}

/** "2026-08-04" -> secondes Unix à minuit, heure locale. */
export function depuisChampDate(valeur: string): number | null {
  if (!valeur) return null;
  const [annee, mois, jour] = valeur.split("-").map(Number);
  if (!annee || !mois || !jour) return null;
  return Math.floor(new Date(annee, mois - 1, jour, 0, 0, 0, 0).getTime() / 1000);
}

/** 150 minutes -> "2 h 30". Le format lisible, pour l'écran. */
export function formaterDuree(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

/** 150 minutes -> "02:30:00". Le format chronomètre. */
export function formaterChrono(secondes: number): string {
  const total = Math.max(0, Math.floor(secondes));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** 150 minutes -> 2.5. Le format décimal, pour Excel et la facturation. */
export function heuresDecimales(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

export function formaterMontant(euros: number): string {
  return euros.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

/** Début de la journée locale contenant `secondes`. */
export function debutDeJour(secondes: number): number {
  const d = new Date(secondes * 1000);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/** Début de la semaine (lundi) contenant `secondes`. */
export function debutDeSemaine(secondes: number): number {
  const d = new Date(secondes * 1000);
  const jour = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - jour);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/** Début du mois contenant `secondes`. */
export function debutDeMois(secondes: number): number {
  const d = new Date(secondes * 1000);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export const LIBELLES_STATUT_ETUDE: Record<string, string> = {
  active: "Active",
  en_pause: "En pause",
  terminee: "Terminée",
  archivee: "Archivée",
};

export const LIBELLES_STATUT_TACHE: Record<string, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  terminee: "Terminée",
};

export const LIBELLES_PRIORITE: Record<string, string> = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
};
