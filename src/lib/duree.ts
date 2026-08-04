/**
 * Analyse une durée saisie à la main, en acceptant les écritures courantes :
 *   "1h30", "1 h 30", "1:30", "90", "90m", "90 min", "1,5", "1.5h"
 * Renvoie un nombre de minutes, ou null si la saisie n'est pas exploitable.
 */
export function analyserDuree(saisie: string): number | null {
  const texte = saisie.trim().toLowerCase().replace(/\s+/g, "");
  if (!texte) return null;

  // "1h30", "1h", "h30" — heures et minutes séparées par h
  const avecH = texte.match(/^(\d+)?h(\d+)?$/);
  if (avecH) {
    const h = Number(avecH[1] ?? 0);
    const m = Number(avecH[2] ?? 0);
    if (m >= 60) return null;
    return h * 60 + m;
  }

  // "1:30"
  const avecDeuxPoints = texte.match(/^(\d+):(\d{1,2})$/);
  if (avecDeuxPoints) {
    const m = Number(avecDeuxPoints[2]);
    if (m >= 60) return null;
    return Number(avecDeuxPoints[1]) * 60 + m;
  }

  // "90m", "90min"
  const avecM = texte.match(/^(\d+(?:[.,]\d+)?)m(?:in)?$/);
  if (avecM) return Math.round(Number(avecM[1].replace(",", ".")));

  // "1,5" ou "1.5" ou "1.5h" — heures décimales
  const decimal = texte.match(/^(\d+(?:[.,]\d+)?)h?$/);
  if (decimal) {
    const valeur = Number(decimal[1].replace(",", "."));
    if (!Number.isFinite(valeur)) return null;
    // Un entier nu sans unité se lit en heures : "2" = 2 h.
    return Math.round(valeur * 60);
  }

  return null;
}

/** "09:30" -> 570 minutes depuis minuit. */
export function analyserHeure(saisie: string): number | null {
  const m = saisie.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const heures = Number(m[1]);
  const minutes = Number(m[2]);
  if (heures > 23 || minutes > 59) return null;
  return heures * 60 + minutes;
}
