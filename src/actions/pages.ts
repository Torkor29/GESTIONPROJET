"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { exigerSession } from "@/lib/auth";

const maintenant = () => Math.floor(Date.now() / 1000);

export async function creerPage(donnees: FormData) {
  await exigerSession();

  const etudeIdBrut = donnees.get("etudeId");
  const parentIdBrut = donnees.get("parentId");

  const [creee] = await db
    .insert(pages)
    .values({
      etudeId: etudeIdBrut ? Number(etudeIdBrut) : null,
      parentId: parentIdBrut ? Number(parentIdBrut) : null,
      titre: String(donnees.get("titre") ?? "").trim() || "Sans titre",
      icone: String(donnees.get("icone") ?? "📄"),
    })
    .returning({ id: pages.id });

  revalidatePath("/", "layout");
  redirect(`/pages/${creee.id}`);
}

/** Sauvegarde automatique depuis l'éditeur : titre, icône et contenu. */
export async function enregistrerPage(entree: {
  id: number;
  titre?: string;
  icone?: string;
  contenu?: string;
}) {
  await exigerSession();
  if (!entree.id) throw new Error("Page manquante.");

  const modifs: Record<string, unknown> = { modifieLe: maintenant() };
  if (entree.titre !== undefined) modifs.titre = entree.titre.trim() || "Sans titre";
  if (entree.icone !== undefined) modifs.icone = entree.icone;
  if (entree.contenu !== undefined) {
    // On refuse un contenu illisible plutôt que d'écraser la page avec.
    try {
      JSON.parse(entree.contenu);
    } catch {
      throw new Error("Contenu de page invalide, sauvegarde annulée.");
    }
    modifs.contenu = entree.contenu;
  }

  await db.update(pages).set(modifs).where(eq(pages.id, entree.id));
  revalidatePath("/", "layout");
}

export async function supprimerPage(donnees: FormData) {
  await exigerSession();

  const id = Number(donnees.get("id"));
  if (!id) throw new Error("Page manquante.");

  const [page] = await db
    .select({ etudeId: pages.etudeId })
    .from(pages)
    .where(eq(pages.id, id))
    .limit(1);

  // Les sous-pages remontent d'un cran plutôt que de disparaître avec le parent.
  await db.update(pages).set({ parentId: null }).where(eq(pages.parentId, id));
  await db.delete(pages).where(eq(pages.id, id));

  revalidatePath("/", "layout");
  redirect(page?.etudeId ? `/etudes/${page.etudeId}` : "/etudes");
}
