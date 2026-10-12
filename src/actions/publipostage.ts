"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { publipostages } from "@/db/schema";
import { exigerAcces } from "@/lib/acces";
import { exigerSession, utilisateurActuel } from "@/lib/auth";
import { STATUTS_PUBLIPOSTAGE } from "@/lib/constantes";
import { debutDeJour, depuisChampDate } from "@/lib/format";
import {
  champsDuModele,
  completerDepuisEtude,
  lireValeurs,
  modelePublipostage,
  titreSuggere,
  type ModelePublipostage,
  type Valeurs,
} from "@/lib/publipostage";
import { etudeParId } from "@/lib/requetes";
import { type EtatFormulaire, messageErreur } from "./etat";

const maintenant = () => Math.floor(Date.now() / 1000);

/** Au-delà, ce n'est plus un champ de trame mais un document dans le document. */
const LONGUEUR_MAX_CHAMP = 10_000;

/**
 * Lit les champs du modèle dans le formulaire. Tout ce qui n'est pas déclaré
 * dans le modèle est ignoré : on ne stocke pas ce qu'on ne sait pas restituer.
 */
function lireChampsModele(modele: ModelePublipostage, donnees: FormData): Valeurs {
  const valeurs: Valeurs = {};
  for (const champ of champsDuModele(modele)) {
    const nom = `champ_${champ.cle}`;
    if (champ.type === "cases") {
      const coches = donnees
        .getAll(nom)
        .map(String)
        .filter((v) => champ.options?.includes(v));
      if (coches.length > 0) valeurs[champ.cle] = coches;
      continue;
    }
    const v = String(donnees.get(nom) ?? "")
      .replace(/\r\n/g, "\n")
      .trim()
      .slice(0, LONGUEUR_MAX_CHAMP);
    if (v === "") continue;
    if (champ.type === "choix" && champ.options && !champ.options.includes(v)) continue;
    valeurs[champ.cle] = v;
  }
  return valeurs;
}

/**
 * Dates de suivi déduites d'un changement de statut, quand elles manquent :
 * passer à « envoyé au coordo » date l'envoi, un retour date le retour.
 * Une date déjà saisie n'est jamais réécrite.
 */
function datesDuStatut(
  statut: string,
  actuelles: { envoyeLe: number | null; retourLe: number | null },
): { envoyeLe: number | null; retourLe: number | null } {
  const aujourdhui = debutDeJour(maintenant());
  const envoyeLe =
    actuelles.envoyeLe ??
    (["envoye_coordo", "corrections", "valide", "signe"].includes(statut) ? aujourdhui : null);
  const retourLe =
    actuelles.retourLe ?? (["corrections", "valide", "signe"].includes(statut) ? aujourdhui : null);
  return { envoyeLe, retourLe };
}

async function publipostageAccessible(id: number, utilisateurId: number) {
  await exigerAcces("publipostages", id, utilisateurId);
  const [ligne] = await db.select().from(publipostages).where(eq(publipostages.id, id)).limit(1);
  if (!ligne) throw new Error("Document introuvable.");
  return ligne;
}

/** Crée un document à partir d'un modèle, prérempli depuis l'étude choisie. */
export async function creerPublipostage(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  let id = 0;
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const modele = modelePublipostage(String(donnees.get("modele") ?? ""));
    if (!modele) return { erreur: "Choisissez un modèle." };

    const etudeIdBrut = donnees.get("etudeId");
    const etudeId = etudeIdBrut ? Number(etudeIdBrut) : null;

    let valeurs: Valeurs = {};
    if (etudeId) {
      // etudeParId filtre sur l'accès : une étude d'un autre compte n'est pas trouvée.
      const etude = await etudeParId(etudeId);
      if (!etude) return { erreur: "Étude introuvable." };
      valeurs = completerDepuisEtude(modele, valeurs, etude);
    }

    const titre = String(donnees.get("titre") ?? "").trim() || titreSuggere(modele, valeurs);

    const [cree] = await db
      .insert(publipostages)
      .values({
        proprietaireId: compte.id,
        etudeId,
        modele: modele.cle,
        titre,
        valeurs: JSON.stringify(valeurs),
      })
      .returning({ id: publipostages.id });
    id = cree.id;
  } catch (e) {
    return { erreur: messageErreur(e) };
  }

  revalidatePath("/publipostage");
  // En dehors du try : redirect() fonctionne en levant une exception, que le
  // catch transformerait en message d'erreur.
  redirect(`/publipostage/${id}`);
}

/** Enregistre les champs du document et son suivi, en une fois. */
export async function enregistrerPublipostage(
  precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  try {
    const compte = await utilisateurActuel();
    if (!compte) return { erreur: "Session expirée. Reconnectez-vous." };

    const id = Number(donnees.get("id"));
    if (!id) return { erreur: "Document introuvable." };
    const actuel = await publipostageAccessible(id, compte.id);

    const modele = modelePublipostage(actuel.modele);
    if (!modele) return { erreur: "Le modèle de ce document n'existe plus." };

    const statut = String(donnees.get("statut") ?? actuel.statut);
    if (!(statut in STATUTS_PUBLIPOSTAGE)) return { erreur: "Statut inconnu." };

    const etudeIdBrut = donnees.get("etudeId");
    const etudeId = etudeIdBrut ? Number(etudeIdBrut) : null;
    if (etudeId && etudeId !== actuel.etudeId) await exigerAcces("etudes", etudeId, compte.id);

    const valeurs = lireChampsModele(modele, donnees);

    // Tant que le titre est celui proposé, il suit les champs : renseigner le
    // centre renomme « Convention — ACRO » en « Convention — ACRO — CH Quimper ».
    // Un titre retouché à la main n'est plus jamais réécrit.
    const titreSaisi = String(donnees.get("titre") ?? "").trim();
    const propose = titreSuggere(modele, lireValeurs(actuel.valeurs));
    const titre =
      !titreSaisi || titreSaisi === propose ? titreSuggere(modele, valeurs) : titreSaisi;

    const saisies = {
      envoyeLe: depuisChampDate(String(donnees.get("envoyeLe") ?? "")),
      retourLe: depuisChampDate(String(donnees.get("retourLe") ?? "")),
    };
    // Les dates suivent le statut seulement quand celui-ci vient de changer :
    // vider volontairement une date ne doit pas la voir réapparaître.
    const dates = statut !== actuel.statut ? datesDuStatut(statut, saisies) : saisies;

    await db
      .update(publipostages)
      .set({
        etudeId,
        titre: titre.slice(0, 300),
        valeurs: JSON.stringify(valeurs),
        statut,
        destinataire: String(donnees.get("destinataire") ?? "").trim() || null,
        ...dates,
        notes: String(donnees.get("notes") ?? "").trim() || null,
        modifieLe: maintenant(),
      })
      .where(eq(publipostages.id, id));

    revalidatePath("/publipostage");
    revalidatePath(`/publipostage/${id}`);
    return { succes: (precedent.succes ?? 0) + 1 };
  } catch (e) {
    return { erreur: messageErreur(e) };
  }
}

/** Changement de statut depuis le tableau de suivi. */
export async function definirStatutPublipostage(id: number, statut: string): Promise<void> {
  const compte = await exigerSession();
  if (!id || !(statut in STATUTS_PUBLIPOSTAGE)) throw new Error("Statut invalide.");
  const actuel = await publipostageAccessible(id, compte.id);

  await db
    .update(publipostages)
    .set({
      statut,
      ...datesDuStatut(statut, actuel),
      modifieLe: maintenant(),
    })
    .where(eq(publipostages.id, id));

  revalidatePath("/publipostage");
  revalidatePath(`/publipostage/${id}`);
}

/**
 * Copie un document pour en faire un autre : la même convention pour un
 * second centre, par exemple. La copie repart en brouillon, sans dates de suivi.
 */
export async function dupliquerPublipostage(donnees: FormData): Promise<void> {
  const compte = await exigerSession();
  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Document manquant.");
  const source = await publipostageAccessible(id, compte.id);

  const [copie] = await db
    .insert(publipostages)
    .values({
      proprietaireId: compte.id,
      etudeId: source.etudeId,
      modele: source.modele,
      titre: `${source.titre} (copie)`.slice(0, 300),
      valeurs: source.valeurs,
      notes: source.notes,
    })
    .returning({ id: publipostages.id });

  revalidatePath("/publipostage");
  redirect(`/publipostage/${copie.id}`);
}

export async function supprimerPublipostage(donnees: FormData): Promise<void> {
  const compte = await exigerSession();
  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Document manquant.");
  await exigerAcces("publipostages", id, compte.id);

  await db.delete(publipostages).where(eq(publipostages.id, id));
  revalidatePath("/publipostage");

  // Supprimé depuis sa propre page, on revient à la liste plutôt que de
  // rester sur une adresse qui ne mène plus nulle part.
  if (donnees.get("retour") === "liste") redirect("/publipostage");
}
