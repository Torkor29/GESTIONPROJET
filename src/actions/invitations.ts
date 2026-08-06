"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invitations, utilisateurs } from "@/db/schema";
import {
  LONGUEUR_MOT_DE_PASSE,
  exigerSession,
  hacherMotDePasse,
  ouvrirSession,
} from "@/lib/auth";
import { modulesSuggeres } from "@/lib/modules";

export type EtatInvitation = {
  erreur?: string;
  message?: string;
  /** Rapporte la saisie : React 19 vide le formulaire après chaque tentative. */
  valeurs?: { nom?: string; email?: string };
};

/** Une invitation vaut sept jours : assez pour la transmettre, pas assez pour traîner. */
const VALIDITE = 7 * 24 * 60 * 60;

const ROLES = new Set(["arc", "tec", "cp", "autre"]);

function normaliserEmail(v: string): string {
  return v.trim().toLowerCase();
}

export async function inviter(
  _precedent: EtatInvitation,
  donnees: FormData,
): Promise<EtatInvitation> {
  const compte = await exigerSession();

  const email = normaliserEmail(String(donnees.get("email") ?? ""));
  const role = String(donnees.get("role") ?? "autre");

  if (!email.includes("@") || email.length < 5) {
    return { erreur: "Cette adresse électronique ne semble pas valide." };
  }

  const existant = db.select().from(utilisateurs).where(eq(utilisateurs.email, email)).get();
  if (existant) return { erreur: "Cette personne a déjà un compte." };

  // Une invitation en cours pour la même adresse est remplacée plutôt que
  // dupliquée : sinon deux liens vivraient en parallèle pour une seule place.
  db.delete(invitations)
    .where(and(eq(invitations.email, email), isNull(invitations.utiliseeLe)))
    .run();

  db.insert(invitations)
    .values({
      jeton: randomBytes(24).toString("base64url"),
      email,
      role: ROLES.has(role) ? role : "autre",
      inviteePar: compte.id,
      expireLe: Math.floor(Date.now() / 1000) + VALIDITE,
    })
    .run();

  revalidatePath("/parametres/equipe");
  return { message: `Invitation créée pour ${email}. Copiez le lien et transmettez-le.` };
}

export async function revoquerInvitation(donnees: FormData): Promise<void> {
  await exigerSession();
  const id = Number(donnees.get("id"));
  if (!id) return;

  db.delete(invitations).where(and(eq(invitations.id, id), isNull(invitations.utiliseeLe))).run();
  revalidatePath("/parametres/equipe");
}

/**
 * Une invitation n'est valable que si elle existe, n'a pas servi et n'a pas
 * expiré. Les trois conditions sont vérifiées ici, et à l'usage : le lien peut
 * dormir plusieurs jours dans une boîte mail.
 */
export async function invitationValide(jeton: string) {
  const invitation = db.select().from(invitations).where(eq(invitations.jeton, jeton)).get();
  if (!invitation) return null;
  if (invitation.utiliseeLe !== null) return null;
  if (invitation.expireLe <= Math.floor(Date.now() / 1000)) return null;
  return invitation;
}

export async function accepterInvitation(
  _precedent: EtatInvitation,
  donnees: FormData,
): Promise<EtatInvitation> {
  const jeton = String(donnees.get("jeton") ?? "");
  const nom = String(donnees.get("nom") ?? "").trim();
  const motDePasse = String(donnees.get("motDePasse") ?? "");

  const invitation = await invitationValide(jeton);
  if (!invitation) {
    return { erreur: "Cette invitation n'est plus valable. Demandez-en une nouvelle." };
  }
  if (!nom) return { erreur: "Indiquez votre nom." };
  if (motDePasse.length < LONGUEUR_MOT_DE_PASSE) {
    return {
      erreur: `Le mot de passe doit faire au moins ${LONGUEUR_MOT_DE_PASSE} caractères.`,
      valeurs: { nom },
    };
  }

  // Entre l'envoi du lien et son usage, quelqu'un a pu créer le compte.
  const deja = db
    .select()
    .from(utilisateurs)
    .where(eq(utilisateurs.email, invitation.email))
    .get();
  if (deja) return { erreur: "Un compte existe déjà pour cette adresse. Connectez-vous." };

  const cree = db
    .insert(utilisateurs)
    .values({
      email: invitation.email,
      nom,
      motDePasse: hacherMotDePasse(motDePasse),
      role: invitation.role,
      modules: JSON.stringify(modulesSuggeres(invitation.role)),
      derniereConnexion: Math.floor(Date.now() / 1000),
    })
    .returning({ id: utilisateurs.id })
    .get();

  db.update(invitations)
    .set({ utiliseeLe: Math.floor(Date.now() / 1000) })
    .where(eq(invitations.id, invitation.id))
    .run();

  await ouvrirSession(cree.id);
  redirect("/parametres");
}
