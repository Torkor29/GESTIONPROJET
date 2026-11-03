"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { etudes, pages } from "@/db/schema";
import { exigerAcces } from "@/lib/acces";
import { exigerSession } from "@/lib/auth";
import { formaterDate } from "@/lib/format";
import { ErreurIA, completerIA } from "@/lib/ia";
import {
  ACTIONS_NOTE,
  CONSIGNES_MISSIONS,
  TYPES_REDACTION,
  ficheEtudePourIA,
  lireMissionsProposees,
  texteDeNote,
  type ActionNote,
  type MissionProposee,
  type TypeRedaction,
} from "@/lib/ia-texte";
import { creerTache } from "./taches";

type Resultat<T> = ({ ok: true } & T) | { ok: false; erreur: string };

function echec(e: unknown): { ok: false; erreur: string } {
  if (e instanceof ErreurIA) return { ok: false, erreur: e.message };
  if (e instanceof Error && e.message) return { ok: false, erreur: e.message };
  return { ok: false, erreur: "Une erreur est survenue. Réessayez." };
}

/** Lit une note accessible et son texte. */
async function noteLisible(pageId: number, utilisateurId: number) {
  await exigerAcces("pages", pageId, utilisateurId);
  const [page] = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
  if (!page) throw new Error("Note introuvable.");
  const texte = texteDeNote(page.contenu);
  if (!texte) throw new Error("La note est vide : écrivez-y quelque chose d'abord.");
  return { page, texte: `Titre : ${page.titre}\n\n${texte}` };
}

const aujourdhui = () =>
  new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Résumer, reformuler, compte rendu, liste d'actions. */
export async function traiterNoteIA(pageId: number, action: ActionNote): Promise<Resultat<{ texte: string }>> {
  try {
    const compte = await exigerSession();
    const consigne = ACTIONS_NOTE[action];
    if (!consigne) throw new Error("Action inconnue.");
    const { texte } = await noteLisible(pageId, compte.id);
    return { ok: true, texte: await completerIA(compte.id, consigne.consignes, texte) };
  } catch (e) {
    return echec(e);
  }
}

/** Missions que la note implique, à valider avant création. */
export async function proposerMissionsIA(pageId: number): Promise<Resultat<{ missions: MissionProposee[] }>> {
  try {
    const compte = await exigerSession();
    const { texte } = await noteLisible(pageId, compte.id);
    const reponse = await completerIA(
      compte.id,
      CONSIGNES_MISSIONS,
      `Date du jour : ${aujourdhui()}\n\n${texte}`,
    );
    return { ok: true, missions: lireMissionsProposees(reponse) };
  } catch (e) {
    return echec(e);
  }
}

/**
 * Crée les missions validées. Chacune passe par `creerTache`, avec ses
 * contrôles habituels, et se rattache à l'étude de la note.
 */
export async function creerMissionsDepuisNote(
  pageId: number,
  missions: MissionProposee[],
): Promise<Resultat<{ creees: number; erreurs: string[] }>> {
  try {
    const compte = await exigerSession();
    await exigerAcces("pages", pageId, compte.id);
    const [page] = await db.select({ etudeId: pages.etudeId }).from(pages).where(eq(pages.id, pageId)).limit(1);
    let creees = 0;
    const erreurs: string[] = [];
    for (const m of missions.slice(0, 20)) {
      const titre = String(m.titre ?? "").trim().slice(0, 200);
      if (!titre) continue;
      const donnees = new FormData();
      donnees.set("titre", titre);
      if (m.notes) donnees.set("notes", String(m.notes).slice(0, 500));
      if (m.echeance) donnees.set("echeance", String(m.echeance));
      if (page?.etudeId) donnees.append("etudeIds", String(page.etudeId));
      const etat = await creerTache({}, donnees);
      if (etat.erreur) erreurs.push(`${titre} : ${etat.erreur}`);
      else creees += 1;
    }
    revalidatePath("/", "layout");
    return { ok: true, creees, erreurs };
  } catch (e) {
    return echec(e);
  }
}

/** Blocs BlockNote à partir d'un texte : un paragraphe par ligne, puces reconnues. */
function blocsDepuisTexte(texte: string) {
  return texte.split("\n").map((ligne) => {
    const puce = /^\s*[-*•]\s+(.*)$/.exec(ligne);
    const titre = /^\s*#{1,3}\s+(.*)$/.exec(ligne);
    const propre = (puce?.[1] ?? titre?.[1] ?? ligne).replace(/\*\*(.+?)\*\*/g, "$1");
    return {
      type: puce ? "bulletListItem" : titre ? "heading" : "paragraph",
      ...(titre ? { props: { level: 3 } } : {}),
      content: propre ? [{ type: "text", text: propre, styles: {} }] : [],
      children: [],
    };
  });
}

/** Range le résultat dans une nouvelle note, à côté de l'originale. */
export async function noteDepuisTexteIA(
  pageId: number,
  titre: string,
  texte: string,
): Promise<Resultat<{ id: number }>> {
  try {
    const compte = await exigerSession();
    await exigerAcces("pages", pageId, compte.id);
    const [source] = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
    if (!source) throw new Error("Note introuvable.");
    const [creee] = await db
      .insert(pages)
      .values({
        proprietaireId: compte.id,
        etudeId: source.etudeId,
        titre: titre.trim().slice(0, 200) || "Sans titre",
        icone: "✨",
        categorie: source.categorie,
        contenu: JSON.stringify(blocsDepuisTexte(texte.slice(0, 40_000))),
      })
      .returning({ id: pages.id });
    revalidatePath("/", "layout");
    return { ok: true, id: creee.id };
  } catch (e) {
    return echec(e);
  }
}

/** Mail, courrier CPP, lettre de suivi… à partir de la fiche de l'étude. */
export async function redigerIA(
  etudeId: number,
  type: TypeRedaction,
  points: string,
): Promise<Resultat<{ texte: string }>> {
  try {
    const compte = await exigerSession();
    const modele = TYPES_REDACTION[type];
    if (!modele) throw new Error("Type de document inconnu.");
    await exigerAcces("etudes", etudeId, compte.id);
    const [e] = await db.select().from(etudes).where(eq(etudes.id, etudeId)).limit(1);
    if (!e) throw new Error("Étude introuvable.");
    const fiche = ficheEtudePourIA({
      Acronyme: e.code,
      Titre: e.nom,
      Promoteur: e.promoteur,
      "Investigateur coordonnateur": e.investigateur,
      "ID-RCB": e.idRcb,
      "N° CTIS / EudraCT": e.numeroCtis,
      "Référence CPP": e.numeroCpp,
      "Début": e.dateDebut ? formaterDate(e.dateDebut) : null,
      "Fin des inclusions prévue": e.dateFinInclusion ? formaterDate(e.dateFinInclusion) : null,
      "Fin prévue": e.dateFin ? formaterDate(e.dateFin) : null,
    });
    const demande = `Date du jour : ${aujourdhui()}\n\nÉtude :\n${fiche}\n\nPoints à aborder :\n${
      points.trim().slice(0, 6000) || "(aucun précisé)"
    }`;
    return { ok: true, texte: await completerIA(compte.id, modele.consignes, demande) };
  } catch (e) {
    return echec(e);
  }
}
