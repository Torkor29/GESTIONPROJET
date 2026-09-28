/**
 * Publipostage : définitions communes au serveur et au navigateur.
 *
 * Un modèle = une trame Word rangée dans `modeles/`, dont les emplacements à
 * compléter portent des balises `{{cle}}`, et la liste des champs qui leur
 * correspondent. Le formulaire de saisie se construit à partir de cette liste ;
 * ajouter un modèle revient donc à déposer sa trame balisée et à déclarer ses
 * champs dans `MODELES_PUBLIPOSTAGE`.
 */

import type { Etude } from "@/db/schema";
import { MODELES_PUBLIPOSTAGE } from "./modeles-publipostage";
import { analyserMontant, versChampDate } from "./format";

export { MODELES_PUBLIPOSTAGE };

export type TypeChamp =
  | "texte"
  | "texte_long"
  | "date"
  | "montant"
  | "nombre"
  | "email"
  | "telephone"
  /** Une seule réponse parmi `options`. */
  | "choix"
  /** Plusieurs réponses possibles parmi `options`. */
  | "cases";

/** Informations de la fiche étude reprises pour préremplir un document. */
export type SourceEtude =
  | "nom"
  | "code"
  | "promoteur"
  | "investigateur"
  | "idRcb"
  | "numeroCtis"
  | "numeroCpp"
  | "client"
  | "description"
  | "dateDebut"
  | "dateFin";

export type Champ = {
  /** Nom de la balise dans la trame Word : `{{cle}}`. */
  cle: string;
  libelle: string;
  type: TypeChamp;
  /** Précision affichée sous le champ. */
  aide?: string;
  exemple?: string;
  options?: string[];
  /** Un champ facultatif laissé vide ne fait pas baisser la complétude. */
  facultatif?: boolean;
  /** Repris de la fiche étude à la création du document. */
  depuisEtude?: SourceEtude;
  /** Occupe toute la largeur du formulaire. */
  large?: boolean;
  /** Date écrite en toutes lettres dans le document : « 28 septembre 2026 ». */
  dateLongue?: boolean;
};

export type Section = { titre: string; description?: string; champs: Champ[] };

export type ModelePublipostage = {
  cle: string;
  nom: string;
  /** Référence qualité de la trame : « ENR-02228 V4 ». */
  reference: string;
  description: string;
  /** Nom du fichier dans `modeles/`. */
  fichier: string;
  sections: Section[];
  /** Champs dont les valeurs composent le titre proposé et le nom du fichier exporté. */
  champsTitre: string[];
  /**
   * Balises déduites des champs saisis, sans question à poser : la
   * qualification de l'article 2 découle de la catégorie cochée, par exemple.
   * Rendre `undefined` laisse la balise sur son texte de repli.
   */
  calcules?: Record<string, (valeurs: Valeurs) => string | undefined>;
};

export type ValeurChamp = string | string[];
export type Valeurs = Record<string, ValeurChamp>;

const PAR_CLE = new Map(MODELES_PUBLIPOSTAGE.map((m) => [m.cle, m]));

export function modelePublipostage(cle: string): ModelePublipostage | undefined {
  return PAR_CLE.get(cle);
}

export function champsDuModele(modele: ModelePublipostage): Champ[] {
  return modele.sections.flatMap((s) => s.champs);
}

/** Lit les valeurs stockées ; une valeur illisible donne un document vierge, pas une erreur. */
export function lireValeurs(brut: string | null | undefined): Valeurs {
  if (!brut) return {};
  try {
    const lu = JSON.parse(brut);
    if (!lu || typeof lu !== "object" || Array.isArray(lu)) return {};
    const valeurs: Valeurs = {};
    for (const [cle, v] of Object.entries(lu)) {
      if (typeof v === "string") valeurs[cle] = v;
      else if (Array.isArray(v)) valeurs[cle] = v.filter((x): x is string => typeof x === "string");
    }
    return valeurs;
  } catch {
    return {};
  }
}

export function estRempli(valeur: ValeurChamp | undefined): boolean {
  if (valeur === undefined) return false;
  return Array.isArray(valeur) ? valeur.length > 0 : valeur.trim() !== "";
}

export type Completude = { remplis: number; total: number; pourcentage: number };

/** Part des champs attendus déjà renseignés. Les champs facultatifs n'y entrent pas. */
export function completude(modele: ModelePublipostage, valeurs: Valeurs): Completude {
  const attendus = champsDuModele(modele).filter((c) => !c.facultatif);
  const remplis = attendus.filter((c) => estRempli(valeurs[c.cle])).length;
  return {
    remplis,
    total: attendus.length,
    pourcentage: attendus.length === 0 ? 100 : Math.round((remplis / attendus.length) * 100),
  };
}

/** Valeur d'une information de l'étude, au format attendu par le formulaire. */
function valeurEtude(etude: Etude, source: SourceEtude): string {
  if (source === "dateDebut" || source === "dateFin") return versChampDate(etude[source]);
  return (etude[source] ?? "").trim();
}

/**
 * Complète les champs vides à partir de la fiche étude. Un champ déjà saisi
 * n'est jamais écrasé : l'étude sert de point de départ, pas de vérité.
 */
export function completerDepuisEtude(
  modele: ModelePublipostage,
  valeurs: Valeurs,
  etude: Etude,
): Valeurs {
  const resultat: Valeurs = { ...valeurs };
  for (const champ of champsDuModele(modele)) {
    if (!champ.depuisEtude || estRempli(resultat[champ.cle])) continue;
    const v = valeurEtude(etude, champ.depuisEtude);
    if (v) resultat[champ.cle] = v;
  }
  return resultat;
}

/** Remplace les espaces fines insécables d'Intl, que certaines polices Word n'ont pas. */
function espacesSures(texte: string): string {
  return texte.replace(/ /g, " ");
}

/**
 * Mise en forme d'une valeur pour le document : dates et montants à la
 * française. `undefined` signale un champ non renseigné.
 */
export function formaterPourDocument(
  champ: Champ,
  valeur: ValeurChamp | undefined,
): string | undefined {
  if (!estRempli(valeur)) return undefined;
  if (Array.isArray(valeur)) return valeur.join(", ");

  const texte = (valeur as string).trim();

  if (champ.type === "date") {
    const [annee, mois, jour] = texte.split("-").map(Number);
    if (!annee || !mois || !jour) return texte;
    const date = new Date(annee, mois - 1, jour);
    return date.toLocaleDateString(
      "fr-FR",
      champ.dateLongue
        ? { day: "numeric", month: "long", year: "numeric" }
        : { day: "2-digit", month: "2-digit", year: "numeric" },
    );
  }

  if (champ.type === "montant") {
    const montant = analyserMontant(texte);
    if (montant === null || montant === undefined) return texte;
    return espacesSures(
      montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }),
    );
  }

  return texte;
}

/**
 * Ce que la trame doit savoir pour se remplir : le texte de chaque balise
 * et l'état de chaque case, champs saisis et champs calculés confondus.
 */
export function sourceFusion(modele: ModelePublipostage, valeurs: Valeurs) {
  const champs = new Map(champsDuModele(modele).map((c) => [c.cle, c]));
  const calcules = modele.calcules ?? {};

  return {
    connait: (cle: string) => champs.has(cle) || cle in calcules,
    texte: (cle: string) => {
      if (cle in calcules) return calcules[cle](valeurs);
      const champ = champs.get(cle);
      return champ ? formaterPourDocument(champ, valeurs[cle]) : undefined;
    },
    coche: (cle: string, option: string) => {
      const v = valeurs[cle];
      return Array.isArray(v) ? v.includes(option) : v === option;
    },
  };
}

/** Titre proposé pour un document, à partir des champs qui l'identifient. */
export function titreSuggere(modele: ModelePublipostage, valeurs: Valeurs): string {
  const morceaux = modele.champsTitre
    .map((cle) => valeurs[cle])
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((v) => v.trim());
  return [modele.nom, ...morceaux].join(" — ");
}
