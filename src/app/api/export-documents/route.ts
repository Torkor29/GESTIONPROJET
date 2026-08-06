import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { estConnecte } from "@/lib/auth";
import { CATEGORIES_DOCUMENT } from "@/lib/constantes";
import { horodatage, reponseCsv, versCsv } from "@/lib/export";
import { formaterDate } from "@/lib/format";
import { tousLesDocuments } from "@/lib/requetes";

export const runtime = "nodejs";

/** Taille lisible : le nombre d'octets brut ne dit rien à personne. */
function taille(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${Math.round((octets / 1024 / 1024) * 10) / 10} Mo`;
}

/**
 * Inventaire documentaire, utile pour vérifier la complétude d'un TMF ou
 * joindre la liste des pièces à un rapport.
 */
export async function GET(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const params = new URL(requete.url).searchParams;
  const etudeId = params.get("etude") ? Number(params.get("etude")) : null;
  const categorie = params.get("categorie") ?? undefined;

  const lignes = await tousLesDocuments({ etudeId, categorie });

  const colonnes = [
    { entete: "Document", valeur: (l: (typeof lignes)[number]) => l.document.nom },
    {
      entete: "Étude",
      valeur: (l: (typeof lignes)[number]) =>
        l.etudeCode ? `${l.etudeCode} — ${l.etudeNom}` : (l.etudeNom ?? "Sans étude"),
    },
    {
      entete: "Catégorie",
      valeur: (l: (typeof lignes)[number]) =>
        CATEGORIES_DOCUMENT[l.document.categorie] ?? l.document.categorie,
    },
    { entete: "Version", valeur: (l: (typeof lignes)[number]) => l.document.version ?? "" },
    {
      entete: "Date du document",
      valeur: (l: (typeof lignes)[number]) =>
        l.document.dateDocument ? formaterDate(l.document.dateDocument) : "",
    },
    {
      entete: "Déposé le",
      valeur: (l: (typeof lignes)[number]) => formaterDate(l.document.creeLe),
    },
    { entete: "Fichier", valeur: (l: (typeof lignes)[number]) => l.document.nomOriginal },
    { entete: "Taille", valeur: (l: (typeof lignes)[number]) => taille(l.document.taille) },
    { entete: "Description", valeur: (l: (typeof lignes)[number]) => l.document.description ?? "" },
  ];

  if (params.get("format") === "csv") {
    return reponseCsv(versCsv(colonnes, lignes), `documents-${horodatage()}.csv`);
  }

  const classeur = new ExcelJS.Workbook();
  classeur.creator = "Vigie";
  classeur.created = new Date();

  const feuille = classeur.addWorksheet("Documents", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  feuille.columns = colonnes.map((c) => ({
    header: c.entete,
    key: c.entete,
    width: c.entete === "Document" || c.entete === "Description" ? 42 : 18,
  }));

  const entete = feuille.getRow(1);
  entete.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  entete.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D9488" } };
  entete.height = 22;

  for (const l of lignes) {
    feuille.addRow(Object.fromEntries(colonnes.map((c) => [c.entete, c.valeur(l)])));
  }
  feuille.getColumn("Description").alignment = { wrapText: true, vertical: "top" };

  if (lignes.length > 0) {
    feuille.autoFilter = { from: "A1", to: `I${lignes.length + 1}` };
  }

  const tampon = await classeur.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(tampon), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="documents-${horodatage()}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
