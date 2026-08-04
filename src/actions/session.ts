"use server";

import { redirect } from "next/navigation";
import { fermerSession, motDePasseValide, ouvrirSession } from "@/lib/auth";

export type EtatConnexion = { erreur?: string };

export async function seConnecter(
  _precedent: EtatConnexion,
  donnees: FormData,
): Promise<EtatConnexion> {
  const saisie = String(donnees.get("motDePasse") ?? "");
  if (!saisie) return { erreur: "Saisissez votre mot de passe." };

  if (!motDePasseValide(saisie)) {
    // Petit délai pour rendre les essais répétés pénibles.
    await new Promise((r) => setTimeout(r, 600));
    return { erreur: "Mot de passe incorrect." };
  }

  await ouvrirSession();
  redirect("/");
}

export async function seDeconnecter(): Promise<void> {
  await fermerSession();
  redirect("/connexion");
}
