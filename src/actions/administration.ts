"use server";

import { revalidatePath } from "next/cache";
import { chargerDonneesDemo, supprimerDonneesDemo } from "@/db/seed";
import { exigerPermission } from "@/lib/gardes";
import { marquerNotificationLue, marquerToutesLues } from "@/lib/notifications";
import { rechercher } from "@/lib/clinique";

export async function rechargerDemo(): Promise<{ ok: boolean; message: string }> {
  try {
    await exigerPermission("admin", "modifier");
    const r = chargerDonneesDemo({ forcer: true });
    revalidatePath("/", "layout");
    return { ok: true, message: r.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Refus." };
  }
}

export async function retirerDemo(): Promise<{ ok: boolean; message: string }> {
  try {
    await exigerPermission("admin", "modifier");
    supprimerDonneesDemo();
    revalidatePath("/", "layout");
    return { ok: true, message: "Données de démonstration retirées." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Refus." };
  }
}

export async function chargerDemoSiAbsent(): Promise<{ ok: boolean; message: string }> {
  try {
    await exigerPermission("admin", "creer");
    const r = chargerDonneesDemo({ forcer: false });
    revalidatePath("/", "layout");
    return { ok: true, message: r.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Refus." };
  }
}

export async function lireNotification(id: number): Promise<void> {
  const { utilisateurActuel } = await import("@/lib/auth");
  const compte = await utilisateurActuel();
  if (!compte) return;
  marquerNotificationLue(id, compte.id);
  revalidatePath("/", "layout");
}

export async function toutLire(): Promise<void> {
  const { utilisateurActuel } = await import("@/lib/auth");
  const compte = await utilisateurActuel();
  if (!compte) return;
  marquerToutesLues(compte.id);
  revalidatePath("/", "layout");
}

export async function rechercheGlobale(q: string) {
  const { utilisateurActuel } = await import("@/lib/auth");
  const compte = await utilisateurActuel();
  if (!compte) return [];
  return rechercher(q);
}
