"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import {
  LONGUEUR_MOT_DE_PASSE,
  aucunCompte,
  cleInstallationValide,
  fermerSession,
  hacherMotDePasse,
  motDePasseCorrespond,
  ouvrirSession,
} from "@/lib/auth";
import { modulesSuggeres } from "@/lib/modules";

/**
 * React 19 réinitialise un formulaire dès que son action a tourné. Sans
 * précaution, une simple faute de frappe viderait tous les champs déjà
 * remplis. L'état renvoyé rapporte donc les valeurs saisies, que le
 * formulaire ré-applique — sauf les mots de passe, qu'on préfère vider.
 */
export type EtatConnexion = {
  erreur?: string;
  valeurs?: { nom?: string; email?: string; role?: string };
};

/** Rend les essais répétés pénibles sans gêner une saisie honnête. */
function freiner() {
  return new Promise((r) => setTimeout(r, 600));
}

const ROLES = new Set([
  "arc",
  "tec",
  "cp",
  "autre",
  "chef_projet",
  "data_manager",
  "investigateur",
  "sponsor",
  "lecture_seule",
]);

function normaliserEmail(valeur: string): string {
  return valeur.trim().toLowerCase();
}

export async function seConnecter(
  _precedent: EtatConnexion,
  donnees: FormData,
): Promise<EtatConnexion> {
  const email = normaliserEmail(String(donnees.get("email") ?? ""));
  const motDePasse = String(donnees.get("motDePasse") ?? "");

  if (!email || !motDePasse) {
    return { erreur: "Renseignez votre adresse et votre mot de passe.", valeurs: { email } };
  }

  const compte = db.select().from(utilisateurs).where(eq(utilisateurs.email, email)).get();

  // Un seul et même message que l'adresse soit inconnue ou le mot de passe
  // faux : sinon la page révélerait quelles adresses ont un compte.
  if (!compte || !compte.actif || !motDePasseCorrespond(motDePasse, compte.motDePasse)) {
    await freiner();
    return { erreur: "Adresse ou mot de passe incorrect.", valeurs: { email } };
  }

  db.update(utilisateurs)
    .set({ derniereConnexion: Math.floor(Date.now() / 1000) })
    .where(eq(utilisateurs.id, compte.id))
    .run();

  await ouvrirSession(compte.id);
  redirect("/bord");
}

export async function sInscrire(
  _precedent: EtatConnexion,
  donnees: FormData,
): Promise<EtatConnexion> {
  // L'inscription n'est ouverte que tant qu'aucun compte n'existe. Les comptes
  // suivants passeront par une invitation.
  if (!aucunCompte()) {
    return { erreur: "Un compte existe déjà. Demandez une invitation à son titulaire." };
  }

  const nom = String(donnees.get("nom") ?? "").trim();
  const email = normaliserEmail(String(donnees.get("email") ?? ""));
  const motDePasse = String(donnees.get("motDePasse") ?? "");
  const role = String(donnees.get("role") ?? "autre");
  const cle = String(donnees.get("cle") ?? "");

  const saisi = { valeurs: { nom, email, role } };

  if (!nom) return { erreur: "Indiquez votre nom.", ...saisi };
  if (!email.includes("@") || email.length < 5) {
    return { erreur: "Cette adresse électronique ne semble pas valide.", ...saisi };
  }
  if (motDePasse.length < LONGUEUR_MOT_DE_PASSE) {
    return {
      erreur: `Le mot de passe doit faire au moins ${LONGUEUR_MOT_DE_PASSE} caractères.`,
      ...saisi,
    };
  }
  if (!cleInstallationValide(cle)) {
    await freiner();
    return { erreur: "Clé d'installation incorrecte.", ...saisi };
  }

  const metier = ROLES.has(role) ? role : "autre";

  const cree = db
    .insert(utilisateurs)
    .values({
      email,
      nom,
      motDePasse: hacherMotDePasse(motDePasse),
      role: metier,
      // Premier compte de l'instance : il administre, quel que soit le métier.
      superAdmin: true,
      // La sélection suggérée par le métier est figée dès la création : la
      // personne arrive sur une navigation déjà pertinente, et peut l'ajuster.
      modules: JSON.stringify(modulesSuggeres(metier)),
      derniereConnexion: Math.floor(Date.now() / 1000),
    })
    .returning({ id: utilisateurs.id })
    .get();

  await ouvrirSession(cree.id);
  // On arrive sur les modules : c'est le moment où l'on comprend le mieux ce
  // que l'outil sait faire, et où l'on a envie d'ajuster.
  redirect("/parametres");
}

export async function seDeconnecter(): Promise<void> {
  await fermerSession();
  redirect("/connexion");
}
