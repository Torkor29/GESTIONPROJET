"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { centres } from "@/db/schema";
import { exigerAcces } from "@/lib/acces";
import { enregistrerAudit } from "@/lib/audit";
import { STATUTS_CENTRE, NIVEAUX_RISQUE } from "@/lib/constantes";
import { depuisChampDate } from "@/lib/format";
import { exigerPermission } from "@/lib/gardes";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

function lire(donnees: FormData) {
  const statut = String(donnees.get("statut") ?? "en_selection");
  const risque = String(donnees.get("risque") ?? "modere");
  if (!(statut in STATUTS_CENTRE)) return { erreur: "Statut de centre inconnu." as const };
  if (!(risque in NIVEAUX_RISQUE)) return { erreur: "Niveau de risque inconnu." as const };
  const etudeId = Number(donnees.get("etudeId"));
  const numero = String(donnees.get("numero") ?? "").trim();
  const nom = String(donnees.get("nom") ?? "").trim();
  if (!etudeId) return { erreur: "Étude obligatoire." as const };
  if (!numero || !nom) return { erreur: "Numéro et nom du centre obligatoires." as const };
  return {
    valeurs: {
      etudeId,
      numero,
      nom,
      etablissement: String(donnees.get("etablissement") ?? "").trim() || null,
      investigateurPrincipal: String(donnees.get("investigateurPrincipal") ?? "").trim() || null,
      email: String(donnees.get("email") ?? "").trim() || null,
      telephone: String(donnees.get("telephone") ?? "").trim() || null,
      adresse: String(donnees.get("adresse") ?? "").trim() || null,
      statut,
      risque,
      dateActivation: depuisChampDate(String(donnees.get("dateActivation") ?? "")),
      dateFermeture: depuisChampDate(String(donnees.get("dateFermeture") ?? "")),
      objectifInclusion: String(donnees.get("objectifInclusion") ?? "").trim()
        ? Number(donnees.get("objectifInclusion"))
        : null,
      notes: String(donnees.get("notes") ?? "").trim() || null,
    },
  };
}

export async function creerCentre(
  _p: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await exigerPermission("centres", "creer");
    const lu = lire(donnees);
    if ("erreur" in lu) return { erreur: lu.erreur };
    await exigerAcces("etudes", lu.valeurs.etudeId, compte.id);
    const cree = db
      .insert(centres)
      .values({ ...lu.valeurs, proprietaireId: compte.id })
      .returning({ id: centres.id })
      .get();
    enregistrerAudit({
      utilisateurId: compte.id,
      action: "creation",
      objetType: "centre",
      objetId: cree.id,
      etudeId: lu.valeurs.etudeId,
      nouvelleValeur: lu.valeurs,
    });
    revalidatePath("/", "layout");
    return { succes: 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

export async function modifierCentre(
  _p: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await exigerPermission("centres", "modifier");
    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Centre introuvable." };
    const existant = db.select().from(centres).where(eq(centres.id, id)).get();
    if (!existant) return { erreur: "Centre introuvable." };
    await exigerAcces("etudes", existant.etudeId, compte.id);
    const lu = lire(donnees);
    if ("erreur" in lu) return { erreur: lu.erreur };
    db.update(centres)
      .set({ ...lu.valeurs, modifieLe: maintenant() })
      .where(eq(centres.id, id))
      .run();
    enregistrerAudit({
      utilisateurId: compte.id,
      action: "modification",
      objetType: "centre",
      objetId: id,
      etudeId: existant.etudeId,
      ancienneValeur: existant,
      nouvelleValeur: lu.valeurs,
    });
    revalidatePath("/", "layout");
    return { succes: 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}
