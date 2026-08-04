import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { estConnecte } from "@/lib/auth";
import { TAILLE_MAX_OCTETS, dossierUploads, nomSur } from "@/lib/fichiers";

export const runtime = "nodejs";

/**
 * Reçoit les fichiers déposés dans l'éditeur. Ils restent sur votre serveur :
 * rien ne part vers un service tiers.
 */
export async function POST(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const formulaire = await requete.formData();
  const fichier = formulaire.get("file");

  if (!(fichier instanceof File)) {
    return NextResponse.json({ erreur: "Aucun fichier reçu." }, { status: 400 });
  }

  if (fichier.size > TAILLE_MAX_OCTETS) {
    return NextResponse.json(
      { erreur: `Fichier trop volumineux (maximum ${TAILLE_MAX_OCTETS / 1024 / 1024} Mo).` },
      { status: 413 },
    );
  }

  const dossier = dossierUploads();
  await fs.mkdir(dossier, { recursive: true });

  // Préfixe aléatoire : deux fichiers du même nom ne s'écrasent pas, et le nom
  // stocké n'est pas devinable depuis l'extérieur.
  const nom = `${randomBytes(8).toString("hex")}-${nomSur(fichier.name)}`;
  const octets = Buffer.from(await fichier.arrayBuffer());
  await fs.writeFile(path.join(dossier, nom), octets);

  return NextResponse.json({ url: `/api/fichiers/${encodeURIComponent(nom)}` });
}
