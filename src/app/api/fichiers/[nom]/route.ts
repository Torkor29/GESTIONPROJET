import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { estConnecte } from "@/lib/auth";
import { dossierUploads, enteteContentDisposition, nomSur, typeMime } from "@/lib/fichiers";

export const runtime = "nodejs";

/** Sert un fichier téléversé. Réservé aux sessions ouvertes. */
export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ nom: string }> },
) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { nom } = await params;
  const nomDemande = nomSur(decodeURIComponent(nom));
  const dossier = dossierUploads();
  const chemin = path.join(dossier, nomDemande);

  // Ceinture et bretelles : même après nettoyage, on vérifie que le chemin
  // résolu reste bien dans le dossier des téléversements.
  if (!path.resolve(chemin).startsWith(path.resolve(dossier) + path.sep)) {
    return NextResponse.json({ erreur: "Chemin invalide." }, { status: 400 });
  }

  try {
    const contenu = await fs.readFile(chemin);
    const type = typeMime(nomDemande);
    return new NextResponse(new Uint8Array(contenu), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=31536000, immutable",
        // Un SVG servi en ligne peut exécuter du script : on force le téléchargement.
        ...(type === "image/svg+xml"
          ? { "Content-Disposition": enteteContentDisposition("attachment", nomDemande) }
          : {}),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ erreur: "Fichier introuvable." }, { status: 404 });
  }
}
