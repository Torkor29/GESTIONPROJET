import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { estConnecte } from "@/lib/auth";
import { horodatage, reponseCsv, versCsv } from "@/lib/export";
import { LIBELLES_STATUT_ETUDE, formaterDate } from "@/lib/format";
import { lireReglementations, referentiel } from "@/lib/referentiels";
import { listerEtudes, progressionParEtude } from "@/lib/requetes";

export const runtime = "nodejs";

/**
 * Portefeuille d'études : la vue que l'on présente en réunion, avec les
 * identifiants réglementaires et l'avancement de chaque checklist.
 */
export async function GET(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const [etudes, progressions] = await Promise.all([
    listerEtudes({ avecArchivees: true }),
    progressionParEtude(),
  ]);

  type Ligne = (typeof etudes)[number];

  const cadres = (e: Ligne) =>
    lireReglementations(e.reglementations)
      .map((c) => referentiel(c))
      .filter((r) => r !== undefined)
      .map((r) => r.nom.split("—")[0].trim())
      .join(", ");

  const colonnes = [
    { entete: "Acronyme", valeur: (e: Ligne) => e.code ?? "" },
    { entete: "Étude", valeur: (e: Ligne) => e.nom },
    { entete: "Statut", valeur: (e: Ligne) => LIBELLES_STATUT_ETUDE[e.statut] ?? e.statut },
    { entete: "Promoteur", valeur: (e: Ligne) => e.promoteur ?? "" },
    { entete: "Investigateur", valeur: (e: Ligne) => e.investigateur ?? "" },
    { entete: "ID-RCB", valeur: (e: Ligne) => e.idRcb ?? "" },
    { entete: "N° CTIS / EudraCT", valeur: (e: Ligne) => e.numeroCtis ?? "" },
    { entete: "Référence CPP", valeur: (e: Ligne) => e.numeroCpp ?? "" },
    { entete: "Cadre réglementaire", valeur: cadres },
    { entete: "Début", valeur: (e: Ligne) => (e.dateDebut ? formaterDate(e.dateDebut) : "") },
    { entete: "Fin prévue", valeur: (e: Ligne) => (e.dateFin ? formaterDate(e.dateFin) : "") },
    {
      entete: "Conformité",
      valeur: (e: Ligne) => {
        const p = progressions.get(e.id);
        return p && p.total > 0 ? `${p.pourcentage} %` : "";
      },
    },
    {
      entete: "Lignes faites",
      valeur: (e: Ligne) => {
        const p = progressions.get(e.id);
        return p && p.total > 0 ? `${p.faits} / ${p.total}` : "";
      },
    },
  ];

  if (new URL(requete.url).searchParams.get("format") === "csv") {
    return reponseCsv(versCsv(colonnes, etudes), `etudes-${horodatage()}.csv`);
  }

  const classeur = new ExcelJS.Workbook();
  classeur.creator = "Vigie";
  classeur.created = new Date();

  const feuille = classeur.addWorksheet("Études", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  feuille.columns = colonnes.map((c) => ({
    header: c.entete,
    key: c.entete,
    width: c.entete === "Étude" || c.entete === "Cadre réglementaire" ? 40 : 18,
  }));

  const entete = feuille.getRow(1);
  entete.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  entete.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D9488" } };
  entete.height = 22;

  for (const e of etudes) {
    feuille.addRow(Object.fromEntries(colonnes.map((c) => [c.entete, c.valeur(e)])));
  }
  feuille.getColumn("Cadre réglementaire").alignment = { wrapText: true, vertical: "top" };

  if (etudes.length > 0) {
    feuille.autoFilter = { from: "A1", to: `M${etudes.length + 1}` };
  }

  const tampon = await classeur.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(tampon), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="etudes-${horodatage()}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
