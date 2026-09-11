/** Lecture de la messagerie configurée sur le serveur. */

export type CompteSmtp = {
  hote: string;
  port: number;
  utilisateur: string;
  motDePasse: string;
  de: string;
};

export function estBoiteGmail(adresse: string): boolean {
  const hote = (adresse.split("@")[1] ?? "").trim().toLowerCase();
  return hote === "gmail.com" || hote === "googlemail.com";
}

/**
 * Compte SMTP, ou `null` si rien n'est configuré.
 *
 * Pour Gmail, l'hôte et le port se déduisent de l'adresse : il suffit
 * d'`SMTP_USER` et d'`SMTP_MOT_DE_PASSE` (mot de passe d'application).
 * Une autre messagerie demande aussi `SMTP_HOTE`.
 */
export function lireCompteSmtp(
  env: Record<string, string | undefined> = process.env,
): CompteSmtp | null {
  const utilisateur = (env.SMTP_USER ?? "").trim();
  const motDePasse = (env.SMTP_MOT_DE_PASSE ?? "").replace(/\s+/g, "");
  if (!utilisateur || !motDePasse) return null;

  const gmail = estBoiteGmail(utilisateur);
  const hote = (env.SMTP_HOTE ?? "").trim() || (gmail ? "smtp.gmail.com" : "");
  if (!hote) return null;

  const brut = Number(env.SMTP_PORT ?? (gmail ? "587" : "587"));
  const port = Number.isInteger(brut) && brut > 0 ? brut : 587;
  const de = (env.SMTP_DE ?? "").trim() || utilisateur;

  return { hote, port, utilisateur, motDePasse, de };
}

/** Un courrier ne part que si la personne change, et n'est pas soi-même. */
export function doitPrevenirAttribution(
  assigneA: number | null,
  precedent: number | null | undefined,
  auteurId: number,
): assigneA is number {
  return assigneA != null && assigneA !== auteurId && assigneA !== precedent;
}
