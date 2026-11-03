/**
 * Préparation des demandes à l'IA et lecture de ses réponses. Aucun appel
 * réseau ici : tout se teste sans modèle.
 */

/** Au-delà, la note est tronquée : un modèle gratuit n'absorbe pas un roman. */
export const LONGUEUR_MAX_NOTE = 24_000;

/**
 * Texte brut d'une note BlockNote (JSON) : un bloc par ligne, listes et
 * sous-blocs compris, tableaux ligne par ligne.
 */
export function texteDeNote(contenu: string): string {
  let blocs: unknown;
  try {
    blocs = JSON.parse(contenu);
  } catch {
    return "";
  }
  const lignes: string[] = [];

  const enLigne = (contenuEnLigne: unknown): string => {
    if (typeof contenuEnLigne === "string") return contenuEnLigne;
    if (!Array.isArray(contenuEnLigne)) return "";
    return contenuEnLigne
      .map((c) => {
        if (!c || typeof c !== "object") return "";
        const o = c as Record<string, unknown>;
        if (typeof o.text === "string") return o.text;
        if (o.content) return enLigne(o.content);
        return "";
      })
      .join("");
  };

  const parcourir = (liste: unknown, profondeur: number) => {
    if (!Array.isArray(liste)) return;
    for (const b of liste) {
      if (!b || typeof b !== "object") continue;
      const bloc = b as Record<string, unknown>;
      const retrait = "  ".repeat(profondeur);
      const puce =
        bloc.type === "bulletListItem" ? "- " : bloc.type === "numberedListItem" ? "1. " : bloc.type === "checkListItem" ? "[ ] " : "";
      const contenuBloc = bloc.content as Record<string, unknown> | unknown[] | undefined;
      if (contenuBloc && !Array.isArray(contenuBloc) && Array.isArray((contenuBloc as Record<string, unknown>).rows)) {
        for (const rangee of (contenuBloc as { rows: { cells?: unknown[] }[] }).rows) {
          lignes.push(retrait + (rangee.cells ?? []).map((c) => enLigne(c)).join(" | "));
        }
      } else {
        const texte = enLigne(contenuBloc);
        if (texte.trim()) lignes.push(retrait + puce + texte);
        else if (bloc.type === "paragraph") lignes.push("");
      }
      parcourir(bloc.children, profondeur + 1);
    }
  };

  parcourir(blocs, 0);
  return lignes.join("\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, LONGUEUR_MAX_NOTE);
}

export const ACTIONS_NOTE = {
  resumer: {
    libelle: "Résumer",
    consignes: "Résume la note fournie en 5 à 10 lignes : l'essentiel, les décisions, ce qui reste ouvert. Texte simple, sans titre.",
  },
  reformuler: {
    libelle: "Reformuler",
    consignes:
      "Reformule la note fournie dans un français clair et professionnel, sans rien ajouter ni retirer d'important. Garde sa structure (titres, listes).",
  },
  compte_rendu: {
    libelle: "Compte rendu",
    consignes:
      "Transforme la note fournie en compte rendu de réunion structuré, avec les rubriques : Objet, Participants (si mentionnés), Points abordés, Décisions, Actions (qui, quoi, quand), Prochaine échéance. Utilise des listes à puces.",
  },
  actions: {
    libelle: "Liste d'actions",
    consignes:
      "Extrais de la note fournie la liste des actions à mener, une par ligne, sous la forme « - [responsable si mentionné] action — échéance si mentionnée ». Rien d'autre.",
  },
} as const;

export type ActionNote = keyof typeof ACTIONS_NOTE;

export const CONSIGNES_MISSIONS = `À partir de la note fournie, propose les missions (tâches à suivre) qu'elle implique.
Réponds UNIQUEMENT avec un tableau JSON, sans texte autour, de la forme :
[{"titre": "Relancer le promoteur pour la convention", "echeance": "2026-11-20", "notes": "précision courte ou vide"}]
- "titre" : court, commence par un verbe à l'infinitif.
- "echeance" : date AAAA-MM-JJ seulement si la note la donne ou permet de la déduire à partir de la date du jour fournie, sinon null.
- 10 missions au plus. Tableau vide [] si la note n'implique rien à faire.`;

export type MissionProposee = { titre: string; echeance: string | null; notes: string };

/**
 * Lit les missions proposées par le modèle. Tolère un bloc de code ```json
 * autour, ou du texte avant le tableau ; écarte les entrées inexploitables.
 */
export function lireMissionsProposees(reponse: string): MissionProposee[] {
  const debut = reponse.indexOf("[");
  const fin = reponse.lastIndexOf("]");
  if (debut < 0 || fin <= debut) return [];
  let brut: unknown;
  try {
    brut = JSON.parse(reponse.slice(debut, fin + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(brut)) return [];
  return brut
    .map((m) => {
      if (!m || typeof m !== "object") return null;
      const o = m as Record<string, unknown>;
      const titre = typeof o.titre === "string" ? o.titre.trim().slice(0, 200) : "";
      if (!titre) return null;
      const echeance =
        typeof o.echeance === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.echeance) ? o.echeance : null;
      const notes = typeof o.notes === "string" ? o.notes.trim().slice(0, 500) : "";
      return { titre, echeance, notes };
    })
    .filter((m): m is MissionProposee => m !== null)
    .slice(0, 10);
}

export const TYPES_REDACTION = {
  relance: {
    libelle: "Mail de relance",
    consignes:
      "Rédige un mail de relance courtois et concis (objet + corps), à partir des informations de l'étude et des points fournis. Termine par une formule de politesse et une signature [Prénom Nom].",
  },
  cpp: {
    libelle: "Courrier au CPP",
    consignes:
      "Rédige un courrier formel adressé au Comité de protection des personnes (en-tête avec références de l'étude : acronyme, titre, ID-RCB, référence CPP si fournis ; objet ; corps ; formule de politesse ; signature [Prénom Nom, fonction]). Ton administratif, précis.",
  },
  suivi_visite: {
    libelle: "Lettre de suivi de visite",
    consignes:
      "Rédige une lettre de suivi de visite de monitoring adressée à l'investigateur du centre : rappel de la visite (date, centre si fournis), constats, actions attendues avec échéances, remerciements, signature [Prénom Nom, ARC]. Structure claire avec rubriques.",
  },
  libre: {
    libelle: "Autre courrier",
    consignes: "Rédige le document demandé, à partir des informations de l'étude et des points fournis.",
  },
} as const;

export type TypeRedaction = keyof typeof TYPES_REDACTION;

/** Fiche d'étude telle qu'envoyée au modèle : seulement les champs renseignés. */
export function ficheEtudePourIA(etude: Record<string, string | null | undefined>): string {
  const lignes = Object.entries(etude)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k} : ${v}`);
  return lignes.length ? lignes.join("\n") : "(aucune information renseignée)";
}
