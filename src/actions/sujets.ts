"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { modelesVisite, sujets, visitesSujet } from "@/db/schema";
import { exigerAcces } from "@/lib/acces";
import { enregistrerAudit } from "@/lib/audit";
import { STATUTS_SUJET, STATUTS_VISITE_SUJET } from "@/lib/constantes";
import { depuisChampDate } from "@/lib/format";
import { exigerPermission } from "@/lib/gardes";
import { prochainParmi } from "@/lib/ids";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

export async function creerSujet(_p: EtatFormulaire, donnees: FormData): Promise<EtatFormulaire> {
  try {
    const compte = await exigerPermission("sujets", "creer");
    const etudeId = Number(donnees.get("etudeId"));
    if (!etudeId) return { erreur: "Étude obligatoire." };
    await exigerAcces("etudes", etudeId, compte.id);

    const statut = String(donnees.get("statut") ?? "screening");
    if (!(statut in STATUTS_SUJET)) return { erreur: "Statut de sujet inconnu." };

    const existants = db.select({ subjectId: sujets.subjectId }).from(sujets).where(eq(sujets.etudeId, etudeId)).all();
    const subjectId =
      String(donnees.get("subjectId") ?? "").trim() ||
      prochainParmi("SUBJ", existants.map((s) => s.subjectId), 5);

    const cree = db
      .insert(sujets)
      .values({
        proprietaireId: compte.id,
        etudeId,
        centreId: Number(donnees.get("centreId")) || null,
        subjectId,
        statut,
        dateScreening: depuisChampDate(String(donnees.get("dateScreening") ?? "")) ?? maintenant(),
        dateInclusion: depuisChampDate(String(donnees.get("dateInclusion") ?? "")),
        bras: String(donnees.get("bras") ?? "").trim() || null,
        notes: String(donnees.get("notes") ?? "").trim() || null,
      })
      .returning({ id: sujets.id })
      .get();

    const modeles = db
      .select()
      .from(modelesVisite)
      .where(eq(modelesVisite.etudeId, etudeId))
      .all();
    const inclusion = depuisChampDate(String(donnees.get("dateInclusion") ?? "")) ?? maintenant();
    for (const m of modeles) {
      const offset = m.fenetreMinJours ?? 0;
      db.insert(visitesSujet)
        .values({
          etudeId,
          sujetId: cree.id,
          centreId: Number(donnees.get("centreId")) || null,
          modeleId: m.id,
          nom: m.nom,
          datePrevue: inclusion + offset * 86400,
          statut: "prevue",
        })
        .run();
    }

    enregistrerAudit({
      utilisateurId: compte.id,
      action: "creation",
      objetType: "sujet",
      objetId: cree.id,
      etudeId,
      nouvelleValeur: { subjectId, statut },
    });
    revalidatePath("/", "layout");
    return { succes: 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierStatutSujet(id: number, statut: string): Promise<void> {
  const compte = await exigerPermission("sujets", "modifier");
  if (!(statut in STATUTS_SUJET)) throw new Error("Statut invalide.");
  const s = db.select().from(sujets).where(eq(sujets.id, id)).get();
  if (!s) throw new Error("Sujet introuvable.");
  await exigerAcces("etudes", s.etudeId, compte.id);
  db.update(sujets).set({ statut, modifieLe: maintenant() }).where(eq(sujets.id, id)).run();
  enregistrerAudit({
    utilisateurId: compte.id,
    action: "modification",
    objetType: "sujet",
    objetId: id,
    etudeId: s.etudeId,
    ancienneValeur: { statut: s.statut },
    nouvelleValeur: { statut },
  });
  revalidatePath("/", "layout");
}

export async function modifierStatutVisiteSujet(id: number, statut: string): Promise<void> {
  const compte = await exigerPermission("visites", "modifier");
  if (!(statut in STATUTS_VISITE_SUJET)) throw new Error("Statut invalide.");
  const v = db.select().from(visitesSujet).where(eq(visitesSujet.id, id)).get();
  if (!v) throw new Error("Visite introuvable.");
  await exigerAcces("etudes", v.etudeId, compte.id);
  db.update(visitesSujet)
    .set({
      statut,
      dateReelle: statut === "realisee" && !v.dateReelle ? maintenant() : v.dateReelle,
      modifieLe: maintenant(),
    })
    .where(eq(visitesSujet.id, id))
    .run();
  revalidatePath("/", "layout");
}

export async function creerModeleVisite(
  _p: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await exigerPermission("etudes", "modifier");
    const etudeId = Number(donnees.get("etudeId"));
    const nom = String(donnees.get("nom") ?? "").trim();
    const code = String(donnees.get("code") ?? "").trim();
    if (!etudeId || !nom || !code) return { erreur: "Étude, code et nom obligatoires." };
    await exigerAcces("etudes", etudeId, compte.id);
    db.insert(modelesVisite)
      .values({
        etudeId,
        code,
        nom,
        type: String(donnees.get("type") ?? "traitement"),
        ordre: Number(donnees.get("ordre") ?? 0),
        fenetreMinJours: String(donnees.get("fenetreMin") ?? "").trim()
          ? Number(donnees.get("fenetreMin"))
          : null,
        fenetreMaxJours: String(donnees.get("fenetreMax") ?? "").trim()
          ? Number(donnees.get("fenetreMax"))
          : null,
      })
      .run();
    revalidatePath("/", "layout");
    return { succes: 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function supprimerModeleVisite(id: number): Promise<void> {
  const compte = await exigerPermission("etudes", "modifier");
  const m = db.select().from(modelesVisite).where(eq(modelesVisite.id, id)).get();
  if (!m) throw new Error("Modèle introuvable.");
  await exigerAcces("etudes", m.etudeId, compte.id);
  db.delete(modelesVisite).where(eq(modelesVisite.id, id)).run();
  enregistrerAudit({
    utilisateurId: compte.id,
    action: "suppression",
    objetType: "modele_visite",
    objetId: id,
    etudeId: m.etudeId,
    ancienneValeur: { code: m.code, nom: m.nom },
  });
  revalidatePath("/", "layout");
}
