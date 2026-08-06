import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { estConnecte } from "@/lib/auth";
import { horodatage as dateDuJour, reponseCsv, versCsv } from "@/lib/export";
import { formaterDate, formaterDuree, heuresDecimales } from "@/lib/format";
import { resoudrePeriode } from "@/lib/periode";
import { dureeMinutes, entreesTemps, totauxParEtude } from "@/lib/requetes";

export const runtime = "nodejs";

const ENTETE = { argb: "FF4F46E5" };
const GRIS = { argb: "FFF5F5F4" };

function styliserEntete(ligne: ExcelJS.Row) {
  ligne.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  ligne.fill = { type: "pattern", pattern: "solid", fgColor: ENTETE };
  ligne.alignment = { vertical: "middle" };
  ligne.height = 22;
}

export async function GET(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const url = new URL(requete.url);
  const periode = resoudrePeriode({
    periode: url.searchParams.get("periode") ?? undefined,
    du: url.searchParams.get("du") ?? undefined,
    au: url.searchParams.get("au") ?? undefined,
  });
  const etudeParam = url.searchParams.get("etude");
  const etudeId = etudeParam ? Number(etudeParam) : null;

  const filtres = { du: periode.du, au: periode.au, etudeId };
  const [lignes, totaux] = await Promise.all([
    entreesTemps(filtres),
    totauxParEtude(filtres),
  ]);

  if (url.searchParams.get("format") === "csv") {
    const contenu = versCsv(
      [
        { entete: "Date", valeur: (l) => formaterDate(l.entree.debut) },
        { entete: "Étude", valeur: (l) => l.etudeNom ?? "Sans étude" },
        { entete: "Client", valeur: (l) => l.etudeClient ?? "" },
        { entete: "Mission", valeur: (l) => l.tacheTitre ?? "" },
        { entete: "Description", valeur: (l) => l.entree.description ?? "" },
        { entete: "Durée", valeur: (l) => formaterDuree(dureeMinutes(l.entree)) },
        // Les heures décimales servent à la facturation : on les donne avec la
        // virgule décimale française, sinon Excel les lit comme du texte.
        {
          entete: "Heures décimales",
          valeur: (l) => String(heuresDecimales(dureeMinutes(l.entree))).replace(".", ","),
        },
        {
          entete: "Montant",
          valeur: (l) =>
            l.etudeTarif
              ? String(
                  Math.round(heuresDecimales(dureeMinutes(l.entree)) * l.etudeTarif * 100) / 100,
                ).replace(".", ",")
              : "",
        },
      ],
      lignes,
    );
    return reponseCsv(contenu, `temps-${dateDuJour()}.csv`);
  }

  const classeur = new ExcelJS.Workbook();
  classeur.creator = "Gestion de projet";
  classeur.created = new Date();

  // ---------------------------------------------------------------- Détail
  const detail = classeur.addWorksheet("Détail", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  detail.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Début", key: "debut", width: 8 },
    { header: "Fin", key: "fin", width: 8 },
    { header: "Étude", key: "etude", width: 28 },
    { header: "Client", key: "client", width: 20 },
    { header: "Tâche", key: "tache", width: 28 },
    { header: "Description", key: "description", width: 36 },
    { header: "Durée", key: "duree", width: 10 },
    { header: "Heures", key: "heures", width: 10 },
    { header: "Tarif €/h", key: "tarif", width: 10 },
    { header: "Montant €", key: "montant", width: 12 },
  ];

  styliserEntete(detail.getRow(1));

  for (const l of lignes) {
    const minutes = dureeMinutes(l.entree);
    const heures = heuresDecimales(minutes);
    const tarif = l.etudeTarif ?? null;

    detail.addRow({
      date: new Date(l.entree.debut * 1000),
      debut: new Date(l.entree.debut * 1000),
      fin: l.entree.fin ? new Date(l.entree.fin * 1000) : null,
      etude: l.etudeNom ?? "Sans étude",
      client: l.etudeClient ?? "",
      tache: l.tacheTitre ?? "",
      description: l.entree.description ?? "",
      duree: formaterDuree(minutes),
      heures,
      tarif,
      montant: tarif ? Math.round(heures * tarif * 100) / 100 : null,
    });
  }

  detail.getColumn("date").numFmt = "dd/mm/yyyy";
  detail.getColumn("debut").numFmt = "hh:mm";
  detail.getColumn("fin").numFmt = "hh:mm";
  detail.getColumn("heures").numFmt = "0.00";
  detail.getColumn("tarif").numFmt = "#,##0.00";
  detail.getColumn("montant").numFmt = "#,##0.00";

  // Ligne de totaux, calculée par Excel : elle suit les filtres appliqués.
  if (lignes.length > 0) {
    const premiere = 2;
    const derniere = lignes.length + 1;
    const totalDetail = detail.addRow({
      description: "TOTAL",
      heures: { formula: `SUBTOTAL(9,I${premiere}:I${derniere})` },
      montant: { formula: `SUBTOTAL(9,K${premiere}:K${derniere})` },
    });
    totalDetail.font = { bold: true };
    totalDetail.fill = { type: "pattern", pattern: "solid", fgColor: GRIS };

    detail.autoFilter = { from: "A1", to: `K${derniere}` };
  }

  // --------------------------------------------------------- Récapitulatif
  const recap = classeur.addWorksheet("Récapitulatif", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  recap.columns = [
    { header: "Étude", key: "etude", width: 32 },
    { header: "Durée", key: "duree", width: 12 },
    { header: "Heures", key: "heures", width: 10 },
    { header: "Tarif €/h", key: "tarif", width: 10 },
    { header: "Montant €", key: "montant", width: 14 },
  ];

  styliserEntete(recap.getRow(1));

  for (const t of totaux) {
    const heures = heuresDecimales(t.minutes);
    recap.addRow({
      etude: t.nom,
      duree: formaterDuree(t.minutes),
      heures,
      tarif: t.tarif ?? null,
      montant: t.tarif ? Math.round(heures * t.tarif * 100) / 100 : null,
    });
  }

  recap.getColumn("heures").numFmt = "0.00";
  recap.getColumn("tarif").numFmt = "#,##0.00";
  recap.getColumn("montant").numFmt = "#,##0.00";

  if (totaux.length > 0) {
    const derniere = totaux.length + 1;
    const totalRecap = recap.addRow({
      etude: "TOTAL",
      heures: { formula: `SUM(C2:C${derniere})` },
      montant: { formula: `SUM(E2:E${derniere})` },
    });
    totalRecap.font = { bold: true };
    totalRecap.fill = { type: "pattern", pattern: "solid", fgColor: GRIS };
  }

  // Rappel du filtre appliqué, pour savoir ce que contient le fichier.
  recap.addRow([]);
  const rappel = recap.addRow([`Période : ${periode.libelle}`]);
  rappel.font = { italic: true, size: 9, color: { argb: "FF78716C" } };
  const genere = recap.addRow([
    `Généré le ${new Date().toLocaleString("fr-FR")} — ${lignes.length} saisie(s)`,
  ]);
  genere.font = { italic: true, size: 9, color: { argb: "FF78716C" } };

  const tampon = await classeur.xlsx.writeBuffer();

  const horodatage = new Date().toISOString().slice(0, 10);
  const nomFichier = `temps-${horodatage}.xlsx`;

  return new NextResponse(new Uint8Array(tampon), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nomFichier}"`,
      "Cache-Control": "no-store",
    },
  });
}
