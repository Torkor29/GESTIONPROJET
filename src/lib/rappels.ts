/**
 * Rappels par courrier sur les missions : quels courriers sont dus, et ce
 * qu'ils disent. Rien ici ne touche à la base ni au réseau, pour que la règle
 * se teste seule ; l'envoi vit dans `envoi-rappels.ts`.
 *
 * Deux rappels distincts, chacun envoyé une seule fois :
 *   — le rappel choisi sur la mission, le jour dit ;
 *   — le rappel automatique, N jours avant l'échéance (N réglé par la
 *     personne qui porte la mission, 0 pour n'en pas recevoir).
 */

import { formaterDate } from "./format";
import { NOM_PRODUIT } from "./site";

export const SECONDES_JOUR = 86400;

export type MissionARappeler = {
  id: number;
  titre: string;
  statut: string;
  archiveeLe: number | null;
  echeance: number | null;
  rappelLe: number | null;
  rappelEnvoyeLe: number | null;
  rappelEcheanceEnvoyeLe: number | null;
  /** Jours d'avance du rappel automatique, chez la personne qui porte la mission. */
  rappelJours: number;
};

export type GenreRappel = "choisi" | "echeance";

/**
 * Rappels dus aujourd'hui pour une mission. `aujourdhui` est le minuit local
 * du jour. Une mission terminée ou archivée n'en reçoit plus ; une échéance
 * déjà passée non plus — le retard se voit dans l'application.
 */
export function rappelsDus(m: MissionARappeler, aujourdhui: number): GenreRappel[] {
  if (m.statut === "terminee" || m.archiveeLe != null) return [];
  const dus: GenreRappel[] = [];

  if (m.rappelLe != null && m.rappelEnvoyeLe == null && m.rappelLe <= aujourdhui) {
    dus.push("choisi");
  }

  if (
    m.echeance != null &&
    m.rappelJours > 0 &&
    m.rappelEcheanceEnvoyeLe == null &&
    m.echeance >= aujourdhui &&
    m.echeance - m.rappelJours * SECONDES_JOUR <= aujourdhui
  ) {
    dus.push("echeance");
  }

  return dus;
}

/** Une mission dont on choisit le rappel le jour même où vient le rappel d'échéance n'en reçoit qu'un. */
export function rappelsAEnvoyer(m: MissionARappeler, aujourdhui: number): GenreRappel[] {
  const dus = rappelsDus(m, aujourdhui);
  return dus.includes("choisi") ? ["choisi"] : dus;
}

/** Jours restants avant l'échéance, en clair. */
function delai(echeance: number, aujourdhui: number): string {
  const jours = Math.round((echeance - aujourdhui) / SECONDES_JOUR);
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return "demain";
  return `dans ${jours} jours`;
}

export function redigerRappel(opts: {
  destinataireNom: string;
  titre: string;
  echeance: number | null;
  etudes: { nom: string; code: string | null }[];
  notes?: string | null;
  href: string;
  aujourdhui: number;
}): { sujet: string; texte: string } {
  const etudes = opts.etudes.map((e) => (e.code ? `${e.code} — ${e.nom}` : e.nom));
  const quand = opts.echeance != null
    ? `pour le ${formaterDate(opts.echeance)} (${delai(opts.echeance, opts.aujourdhui)})`
    : "sans échéance fixée";

  const lignes = [
    `Bonjour ${opts.destinataireNom},`,
    "",
    `Attention, vous avez une mission ${quand} :`,
    "",
    `Mission : ${opts.titre}`,
  ];
  if (etudes.length === 1) lignes.push(`Étude : ${etudes[0]}`);
  if (etudes.length > 1) lignes.push(`Études :\n  ${etudes.join("\n  ")}`);
  const commentaire = (opts.notes ?? "").trim();
  if (commentaire) lignes.push("", "Commentaire :", commentaire);
  lignes.push("", "Ouvrir la mission :", opts.href, "", "—", NOM_PRODUIT);

  const sujetQuand = opts.echeance != null ? ` — pour le ${formaterDate(opts.echeance)}` : "";
  return { sujet: `Rappel : ${opts.titre}${sujetQuand}`, texte: lignes.join("\n") };
}
