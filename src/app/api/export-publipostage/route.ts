import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { estConnecte } from "@/lib/auth";
import { STATUTS_PUBLIPOSTAGE } from "@/lib/constantes";
import { horodatage, reponseCsv, versCsv } from "@/lib/export";
import { SECONDES_PAR_JOUR, formaterDate } from "@/lib/format";
import { completude, lireValeurs, modelePublipostage } from "@/lib/publipostage";
import { tousLesPublipostages } from "@/lib/requetes";

export const runtime = "nodejs";

/**
 * Suivi des documents de publipostage : où en est chaque convention, chaque
 * fiche, et depuis quand elle attend le coordo. De quoi faire le point en
 * réunion ou préparer une relance groupée.
 */
export async function GET(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const params = new URL(requete.url).searchParams;
  const etudeId = params.get("etude") ? Number(params.get("etude")) : null;
  const lignes = await tousLesPublipostages({
    etudeId,
    modele: params.get("modele") ?? undefined,
    statut: params.get("statut") ?? undefined,
  });

  const maintenant = Math.floor(Date.now() / 1000);
  type Ligne = (typeof lignes)[number];

  const attente = (l: Ligne) => {
    const p = l.publipostage;
    return p.statut === "envoye_coordo" && p.envoyeLe
      ? Math.floor((maintenant - p.envoyeLe) / SECONDES_PAR_JOUR)
      : "";
  };
  const complete = (l: Ligne) => {
    const modele = modelePublipostage(l.publipostage.modele);
    return modele ? `${completude(modele, lireValeurs(l.publipostage.valeurs)).pourcentage} %` : "";
  };

  const colonnes = [
    { entete: "Document", valeur: (l: Ligne) => l.publipostage.titre },
    {
      entete: "Modèle",
      valeur: (l: Ligne) => modelePublipostage(l.publipostage.modele)?.nom ?? l.publipostage.modele,
    },
    {
      entete: "Étude",
      valeur: (l: Ligne) =>
        l.etudeCode ? `${l.etudeCode} — ${l.etudeNom}` : (l.etudeNom ?? "Sans étude"),
    },
    {
      entete: "Statut",
      valeur: (l: Ligne) => STATUTS_PUBLIPOSTAGE[l.publipostage.statut] ?? l.publipostage.statut,
    },
    { entete: "Envoyé à", valeur: (l: Ligne) => l.publipostage.destinataire ?? "" },
    {
      entete: "Envoyé le",
      valeur: (l: Ligne) => (l.publipostage.envoyeLe ? formaterDate(l.publipostage.envoyeLe) : ""),
    },
    { entete: "Jours d'attente", valeur: attente },
    {
      entete: "Retour le",
      valeur: (l: Ligne) => (l.publipostage.retourLe ? formaterDate(l.publipostage.retourLe) : ""),
    },
    { entete: "Complété", valeur: complete },
    { entete: "Notes", valeur: (l: Ligne) => l.publipostage.notes ?? "" },
    { entete: "Modifié le", valeur: (l: Ligne) => formaterDate(l.publipostage.modifieLe) },
  ];

  if (params.get("format") === "csv") {
    return reponseCsv(versCsv(colonnes, lignes), `publipostage-${horodatage()}.csv`);
  }

  const classeur = new ExcelJS.Workbook();
  classeur.creator = "Vigie";
  classeur.created = new Date();

  const feuille = classeur.addWorksheet("Publipostage", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  feuille.columns = colonnes.map((c) => ({
    header: c.entete,
    key: c.entete,
    width: c.entete === "Document" || c.entete === "Notes" ? 42 : 18,
  }));

  const entete = feuille.getRow(1);
  entete.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  entete.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D9488" } };
  entete.height = 22;

  for (const l of lignes) {
    feuille.addRow(Object.fromEntries(colonnes.map((c) => [c.entete, c.valeur(l)])));
  }
  feuille.getColumn("Notes").alignment = { wrapText: true, vertical: "top" };

  if (lignes.length > 0) {
    feuille.autoFilter = { from: "A1", to: `K${lignes.length + 1}` };
  }

  const tampon = await classeur.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(tampon), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="publipostage-${horodatage()}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
