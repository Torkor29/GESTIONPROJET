import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { estConnecte } from "@/lib/auth";
import { horodatage, reponseCsv, versCsv } from "@/lib/export";
import {
  COLONNES_SUIVI,
  valeurSuivi,
  type LigneSuivi,
} from "@/lib/extraction-missions";
import { suiviMissions } from "@/lib/extraction-serveur";

export const runtime = "nodejs";

const ENCRE_ENTETE = "FF2B59D1";

function paramsDepuis(requete: Request) {
  return Object.fromEntries(new URL(requete.url).searchParams.entries());
}

export async function GET(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { lignes, etapes, synthese, parEtude } = await suiviMissions(paramsDepuis(requete));

  if (new URL(requete.url).searchParams.get("format") === "csv") {
    const contenu = versCsv(
      COLONNES_SUIVI.map((c) => ({
        entete: c.entete,
        valeur: (l: LigneSuivi) => valeurSuivi(l, c.cle),
      })),
      lignes,
    );
    return reponseCsv(contenu, `suivi-missions-${horodatage()}.csv`);
  }

  const classeur = new ExcelJS.Workbook();
  classeur.creator = "Vigie Clinique";
  classeur.created = new Date();

  const suivi = classeur.addWorksheet("Suivi", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  suivi.columns = COLONNES_SUIVI.map((c) => ({
    header: c.entete,
    key: c.cle,
    width: c.largeur,
  }));
  stylerEntete(suivi);
  for (const ligne of lignes) {
    const ajoutee = suivi.addRow(
      Object.fromEntries(COLONNES_SUIVI.map((c) => [c.cle, valeurSuivi(ligne, c.cle)])),
    );
    ajoutee.alignment = { vertical: "top", wrapText: true };
    if (ligne.enRetard) {
      ajoutee.getCell("enRetard").font = { bold: true, color: { argb: "FFDC2626" } };
      ajoutee.getCell("delai").font = { color: { argb: "FFDC2626" } };
    }
  }
  if (lignes.length > 0) {
    suivi.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: lignes.length + 1, column: COLONNES_SUIVI.length },
    };
  }

  const feuilleEtapes = classeur.addWorksheet("Étapes", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  feuilleEtapes.columns = [
    { header: "Mission", key: "mission", width: 42 },
    { header: "Étude", key: "etude", width: 16 },
    { header: "Étape", key: "etape", width: 40 },
    { header: "État", key: "etat", width: 12 },
  ];
  stylerEntete(feuilleEtapes);
  for (const e of etapes) feuilleEtapes.addRow(e);
  if (etapes.length > 0) {
    feuilleEtapes.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: etapes.length + 1, column: 4 },
    };
  }

  const feuilleSynthese = classeur.addWorksheet("Synthèse");
  feuilleSynthese.columns = [
    { header: "Indicateur", key: "indicateur", width: 22 },
    { header: "Nombre", key: "nombre", width: 12 },
    { header: "", key: "vide", width: 4 },
    { header: "Étude", key: "etude", width: 18 },
    { header: "Missions", key: "total", width: 12 },
    { header: "Non démarrées", key: "aFaire", width: 16 },
    { header: "En cours", key: "enCours", width: 12 },
    { header: "Terminées", key: "terminees", width: 12 },
    { header: "En retard", key: "enRetard", width: 12 },
  ];
  stylerEntete(feuilleSynthese);
  const global = [
    { indicateur: "Missions", nombre: synthese.total },
    { indicateur: "Non démarrées", nombre: synthese.aFaire },
    { indicateur: "En cours", nombre: synthese.enCours },
    { indicateur: "Terminées", nombre: synthese.terminees },
    { indicateur: "En retard", nombre: synthese.enRetard },
  ];
  const max = Math.max(global.length, parEtude.length);
  for (let i = 0; i < max; i++) {
    const g = global[i];
    const e = parEtude[i];
    feuilleSynthese.addRow({
      indicateur: g?.indicateur ?? "",
      nombre: g?.nombre ?? "",
      etude: e?.etude ?? "",
      total: e?.synthese.total ?? "",
      aFaire: e?.synthese.aFaire ?? "",
      enCours: e?.synthese.enCours ?? "",
      terminees: e?.synthese.terminees ?? "",
      enRetard: e?.synthese.enRetard ?? "",
    });
  }

  const tampon = await classeur.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(tampon), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="suivi-missions-${horodatage()}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

function stylerEntete(feuille: ExcelJS.Worksheet) {
  const entete = feuille.getRow(1);
  entete.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  entete.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ENCRE_ENTETE } };
  entete.height = 22;
}
