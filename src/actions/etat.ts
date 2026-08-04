/**
 * État renvoyé par les formulaires.
 *
 * Les Server Actions ne doivent pas signaler une erreur de saisie en levant une
 * exception : en production, Next masque le message et l'utilisateur reçoit un
 * pavé technique en anglais. On renvoie donc l'erreur comme une valeur.
 */
export type EtatFormulaire = {
  erreur?: string;
  /** Incrémenté à chaque succès : permet au formulaire de savoir qu'il peut se fermer. */
  succes?: number;
};

export const VIDE: EtatFormulaire = {};

/** Traduit une exception inattendue en message affichable. */
export function messageErreur(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return "Une erreur est survenue. Réessayez.";
}
