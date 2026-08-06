import fs from "node:fs/promises";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { objetAccessible } from "@/lib/acces";
import { utilisateurActuel } from "@/lib/auth";
import { dossierUploads, enteteContentDisposition, nomSur } from "@/lib/fichiers";

export const runtime = "nodejs";

/**
 * Sert un document par son identifiant, en restituant son nom d'origine.
 * `?apercu=1` l'affiche dans le navigateur au lieu de le télécharger.
 */
export async function GET(
  requete: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const compte = await utilisateurActuel();
  if (!compte) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  // Le filtre d'accès est dans la requête elle-même : être connecté ne suffit
  // pas, il faut posséder le document ou être convié sur son étude. Sans ce
  // filtre, n'importe quel compte téléchargerait les pièces d'un autre en
  // faisant défiler les identifiants.
  const [doc] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, Number(id)),
        objetAccessible(documents.proprietaireId, documents.etudeId, compte.id),
      ),
    )
    .limit(1);

  if (!doc) {
    return NextResponse.json({ erreur: "Document introuvable." }, { status: 404 });
  }

  const dossier = dossierUploads();
  const chemin = path.join(dossier, nomSur(doc.nomFichier));
  if (!path.resolve(chemin).startsWith(path.resolve(dossier) + path.sep)) {
    return NextResponse.json({ erreur: "Chemin invalide." }, { status: 400 });
  }

  let contenu: Buffer;
  try {
    contenu = await fs.readFile(chemin);
  } catch {
    return NextResponse.json(
      { erreur: "Le fichier est absent du disque. La fiche existe mais le contenu a disparu." },
      { status: 404 },
    );
  }

  const apercu = new URL(requete.url).searchParams.get("apercu") === "1";
  // Un SVG ou un HTML affiché en ligne peut exécuter du script : ces types sont
  // toujours téléchargés, jamais rendus dans la page.
  const typeRisque = /svg|html/i.test(doc.typeMime);
  const disposition = apercu && !typeRisque ? "inline" : "attachment";

  return new NextResponse(new Uint8Array(contenu), {
    headers: {
      "Content-Type": doc.typeMime,
      "Content-Disposition": enteteContentDisposition(disposition, doc.nomOriginal),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
