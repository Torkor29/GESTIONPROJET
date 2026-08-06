"use server";

import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { etudes } from "@/db/schema";
import { exigerAcces } from "@/lib/acces";
import { exigerSession, utilisateurActuel } from "@/lib/auth";
import { TAILLE_MAX_OCTETS, dossierUploads, nomSur } from "@/lib/fichiers";
import { depuisChampDate } from "@/lib/format";
import { REFERENTIELS_PAR_CLE } from "@/lib/referentiels";
import { synchroniserChecklists } from "./checklists";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

function lireTarif(valeur: FormDataEntryValue | null):
  | { tarif: number | null }
  | { erreur: string } {
  const brut = String(valeur ?? "").replace(",", ".").trim();
  if (!brut) return { tarif: null };

  const n = Number(brut);
  if (!Number.isFinite(n) || n < 0) {
    return { erreur: "Tarif horaire invalide. Indiquez un nombre, par exemple 75." };
  }
  return { tarif: n };
}

/** Ne retient que les clés de référentiels réellement connues. */
function lireReglementationsFormulaire(donnees: FormData): string[] {
  return donnees
    .getAll("reglementations")
    .map(String)
    .filter((cle) => REFERENTIELS_PAR_CLE.has(cle));
}

/** Enregistre l'image de couverture si un fichier a été fourni. */
async function enregistrerCouverture(
  donnees: FormData,
): Promise<{ url: string | null } | { erreur: string }> {
  const fichier = donnees.get("imageCouverture");
  if (!(fichier instanceof File) || fichier.size === 0) return { url: null };

  if (!fichier.type.startsWith("image/")) {
    return { erreur: "L'image de couverture doit être un fichier image." };
  }
  if (fichier.size > TAILLE_MAX_OCTETS) {
    return { erreur: `Image trop volumineuse (maximum ${TAILLE_MAX_OCTETS / 1024 / 1024} Mo).` };
  }

  const dossier = dossierUploads();
  await fs.mkdir(dossier, { recursive: true });

  const nom = `${randomBytes(8).toString("hex")}-${nomSur(fichier.name)}`;
  await fs.writeFile(path.join(dossier, nom), Buffer.from(await fichier.arrayBuffer()));

  return { url: `/api/fichiers/${encodeURIComponent(nom)}` };
}

function champsCommuns(donnees: FormData) {
  return {
    nom: String(donnees.get("nom") ?? "").trim(),
    code: String(donnees.get("code") ?? "").trim().toUpperCase() || null,
    client: String(donnees.get("client") ?? "").trim() || null,
    description: String(donnees.get("description") ?? "").trim() || null,
    couleur: String(donnees.get("couleur") ?? "#6366f1"),
    promoteur: String(donnees.get("promoteur") ?? "").trim() || null,
    investigateur: String(donnees.get("investigateur") ?? "").trim() || null,
    idRcb: String(donnees.get("idRcb") ?? "").trim() || null,
    numeroCtis: String(donnees.get("numeroCtis") ?? "").trim() || null,
    numeroCpp: String(donnees.get("numeroCpp") ?? "").trim() || null,
    dateDebut: depuisChampDate(String(donnees.get("dateDebut") ?? "")),
    dateFin: depuisChampDate(String(donnees.get("dateFin") ?? "")),
    reglementations: JSON.stringify(lireReglementationsFormulaire(donnees)),
  };
}

export async function creerEtude(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  let nouvelId: number;

  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const champs = champsCommuns(donnees);
    if (!champs.nom) return { erreur: "Le nom de l'étude est obligatoire." };

    const tarif = lireTarif(donnees.get("tarifHoraire"));
    if ("erreur" in tarif) return { erreur: tarif.erreur };

    const couverture = await enregistrerCouverture(donnees);
    if ("erreur" in couverture) return { erreur: couverture.erreur };

    const [creee] = await db
      .insert(etudes)
      .values({
        ...champs,
        proprietaireId: compte.id,
        tarifHoraire: tarif.tarif,
        imageCouverture: couverture.url,
      })
      .returning({ id: etudes.id });

    nouvelId = creee.id;

    // Les checklists réglementaires suivent immédiatement les cases cochées.
    await synchroniserChecklists(nouvelId);
    revalidatePath("/", "layout");
  } catch (e) {
    return { erreur: messageErreur(e) };
  }

  redirect(`/etudes/${nouvelId}`);
}

export async function modifierEtude(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Étude introuvable." };
    await exigerAcces("etudes", id, compte.id);

    const champs = champsCommuns(donnees);
    if (!champs.nom) return { erreur: "Le nom de l'étude est obligatoire." };

    const tarif = lireTarif(donnees.get("tarifHoraire"));
    if ("erreur" in tarif) return { erreur: tarif.erreur };

    const couverture = await enregistrerCouverture(donnees);
    if ("erreur" in couverture) return { erreur: couverture.erreur };

    await db
      .update(etudes)
      .set({
        ...champs,
        statut: String(donnees.get("statut") ?? "active"),
        tarifHoraire: tarif.tarif,
        // Pas de nouvelle image envoyée : on conserve celle déjà en place.
        ...(couverture.url ? { imageCouverture: couverture.url } : {}),
        modifieLe: maintenant(),
      })
      .where(eq(etudes.id, id));

    const bilan = await synchroniserChecklists(id);
    revalidatePath("/", "layout");

    if (bilan.conservees > 0) {
      return {
        succes: (precedent.succes ?? 0) + 1,
        avertissement:
          `${bilan.conservees} ligne(s) de checklist déjà cochées ou annotées ont été ` +
          `conservées bien que leur référentiel ait été décoché.`,
      };
    }
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/** Retire l'image de couverture d'une étude. */
export async function retirerCouverture(donnees: FormData) {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Étude manquante.");
  await exigerAcces("etudes", id, compte.id);

  await db.update(etudes).set({ imageCouverture: null }).where(eq(etudes.id, id));
  revalidatePath("/", "layout");
}

export async function supprimerEtude(donnees: FormData) {
  const compte = await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Étude manquante.");
  await exigerAcces("etudes", id, compte.id);

  // Pages, tâches, temps, documents, checklists et FAQ partent avec (CASCADE).
  await db.delete(etudes).where(eq(etudes.id, id));

  revalidatePath("/", "layout");
  redirect("/etudes");
}
