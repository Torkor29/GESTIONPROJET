import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { utilisateurActuel } from "@/lib/auth";
import { PdfIndisponible, convertirEnPdf } from "@/lib/conversion-pdf";
import { dossierModeles, enteteContentDisposition } from "@/lib/fichiers";
import { remplirDocx } from "@/lib/fusion-docx";
import { lireValeurs, modelePublipostage, sourceFusion } from "@/lib/publipostage";
import { publipostageParId } from "@/lib/requetes";

export const runtime = "nodejs";

/** Nom de fichier lisible, sans caractère que Windows refuserait. */
function nomExport(titre: string, extension: string): string {
  const propre = titre
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
  return `${propre || "document"}.${extension}`;
}

/**
 * Génère le document complété, à la volée : `?format=docx` (par défaut) ou
 * `?format=pdf`. Rien n'est stocké — l'export reflète toujours la dernière
 * version enregistrée des champs.
 */
export async function GET(requete: Request, { params }: { params: Promise<{ id: string }> }) {
  const compte = await utilisateurActuel();
  if (!compte) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  // publipostageParId filtre sur l'accès : un document d'un autre compte
  // n'est pas trouvé, quel que soit l'identifiant tenté.
  const ligne = await publipostageParId(Number(id));
  if (!ligne) {
    return NextResponse.json({ erreur: "Document introuvable." }, { status: 404 });
  }

  const doc = ligne.publipostage;
  const modele = modelePublipostage(doc.modele);
  if (!modele) {
    return NextResponse.json({ erreur: "Le modèle de ce document n'existe plus." }, { status: 404 });
  }

  // `modele.fichier` vient du catalogue, jamais de la requête : aucun chemin
  // fourni par l'utilisateur n'atteint le système de fichiers.
  let trame: Buffer;
  try {
    trame = await fs.readFile(path.join(dossierModeles(), modele.fichier));
  } catch {
    return NextResponse.json(
      { erreur: `La trame « ${modele.fichier} » est absente du serveur.` },
      { status: 500 },
    );
  }

  const docx = await remplirDocx(trame, sourceFusion(modele, lireValeurs(doc.valeurs)));

  const format = new URL(requete.url).searchParams.get("format") === "pdf" ? "pdf" : "docx";

  if (format === "docx") {
    return new NextResponse(new Uint8Array(docx), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": enteteContentDisposition("attachment", nomExport(doc.titre, "docx")),
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const pdf = await convertirEnPdf(docx);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": enteteContentDisposition("attachment", nomExport(doc.titre, "pdf")),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message =
      e instanceof PdfIndisponible
        ? e.message
        : "La conversion en PDF a échoué. Le document Word reste téléchargeable.";
    return new NextResponse(message, {
      status: e instanceof PdfIndisponible ? 503 : 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
