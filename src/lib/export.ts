import "server-only";

/**
 * Sérialisation CSV pensée pour Excel en français.
 *
 * Deux détails font toute la différence à l'ouverture :
 *   — le séparateur est le point-virgule, celui qu'attend Excel en locale
 *     française ; avec une virgule, tout atterrit dans une seule colonne ;
 *   — le fichier commence par une marque d'ordre des octets (BOM), sans
 *     laquelle Excel lit l'UTF-8 comme du latin-1 et affiche « Ã© » au lieu
 *     de « é ».
 */
const SEPARATEUR = ";";
const BOM = "﻿";

/** Une valeur de cellule, ramenée à du texte sûr. */
function cellule(valeur: unknown): string {
  if (valeur === null || valeur === undefined) return "";

  const texte = String(valeur);

  // Une valeur commençant par =, +, - ou @ est interprétée comme une formule
  // par Excel : un contenu saisi par un utilisateur pourrait alors s'exécuter
  // à l'ouverture. On la neutralise en la préfixant d'une apostrophe.
  const risque = /^[=+\-@\t\r]/.test(texte);
  const echappe = (risque ? `'${texte}` : texte).replace(/"/g, '""');

  return `"${echappe}"`;
}

export type ColonneCsv<T> = {
  entete: string;
  valeur: (ligne: T) => unknown;
};

export function versCsv<T>(colonnes: ColonneCsv<T>[], lignes: T[]): string {
  const entetes = colonnes.map((c) => cellule(c.entete)).join(SEPARATEUR);
  const corps = lignes.map((l) =>
    colonnes.map((c) => cellule(c.valeur(l))).join(SEPARATEUR),
  );
  // Fins de ligne CRLF : c'est ce qu'attendent Excel et la plupart des tableurs.
  return BOM + [entetes, ...corps].join("\r\n") + "\r\n";
}

/** Réponse HTTP prête à télécharger, avec le bon type et le bon nom. */
export function reponseCsv(contenu: string, nomFichier: string): Response {
  return new Response(contenu, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomFichier}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Horodatage court pour nommer les fichiers exportés. */
export function horodatage(): string {
  return new Date().toISOString().slice(0, 10);
}
