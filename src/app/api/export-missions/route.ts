import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { estConnecte } from "@/lib/auth";
import { LIBELLES_STATUT_MISSION } from "@/lib/constantes";
import { LIBELLES_PRIORITE } from "@/lib/format";
import { horodatage, reponseCsv, versCsv } from "@/lib/export";
import { formaterDate } from "@/lib/format";
import { toutesLesTaches } from "@/lib/requetes";

export const runtime = "nodejs";

export async function GET(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const params = new URL(requete.url).searchParams;
  const etudeId = params.get("etude") ? Number(params.get("etude")) : null;
  const statut = params.get("statut");
  const recherche = (params.get("q") ?? "").trim().toLowerCase();
  const masquerTerminees = params.get("masquerTerminees") === "1";

  const toutes = await toutesLesTaches();
  const lignes = toutes.filter(({ tache, sousTaches: etapes }) => {
    if (etudeId && tache.etudeId !== etudeId) return false;
    if (statut && tache.statut !== statut) return false;
    if (masquerTerminees && tache.statut === "terminee") return false;
    if (recherche) {
      const texte = `${tache.titre} ${tache.notes ?? ""} ${etapes.map((s) => s.titre).join(" ")}`.toLowerCase();
      if (!texte.includes(recherche)) return false;
    }
    return true;
  });

  const maintenantCsv = Math.floor(Date.now() / 1000);

  // Le CSV s'ouvre dans n'importe quel tableur et se retravaille sans effort ;
  // le XLSX apporte la mise en forme et les filtres.
  if (params.get("format") === "csv") {
    const contenu = versCsv(
      [
        { entete: "Mission", valeur: (l) => l.tache.titre },
        {
          entete: "Étude",
          valeur: (l) =>
            l.etudeCode ? `${l.etudeCode} — ${l.etudeNom}` : (l.etudeNom ?? "Sans étude"),
        },
        { entete: "Attribuée à", valeur: (l) => l.assigneNom ?? "" },
        {
          entete: "Statut",
          valeur: (l) => LIBELLES_STATUT_MISSION[l.tache.statut] ?? l.tache.statut,
        },
        {
          entete: "Priorité",
          valeur: (l) => LIBELLES_PRIORITE[l.tache.priorite] ?? l.tache.priorite,
        },
        { entete: "Échéance", valeur: (l) => (l.tache.echeance ? formaterDate(l.tache.echeance) : "") },
        {
          entete: "En retard",
          valeur: (l) =>
            l.tache.statut !== "terminee" && l.tache.echeance && l.tache.echeance < maintenantCsv
              ? "OUI"
              : "",
        },
        { entete: "Commentaire", valeur: (l) => l.tache.notes ?? "" },
        {
          entete: "Étapes",
          valeur: (l) => {
            const etapes = l.sousTaches ?? [];
            if (etapes.length === 0) return "";
            const faites = etapes.filter((s) => s.faite).length;
            return `${faites}/${etapes.length}`;
          },
        },
        {
          entete: "Terminée le",
          valeur: (l) => (l.tache.termineeLe ? formaterDate(l.tache.termineeLe) : ""),
        },
      ],
      lignes,
    );
    return reponseCsv(contenu, `missions-${horodatage()}.csv`);
  }

  const classeur = new ExcelJS.Workbook();
  classeur.creator = "Gestion de projet";
  classeur.created = new Date();

  const feuille = classeur.addWorksheet("Missions", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  feuille.columns = [
    { header: "Mission", key: "titre", width: 52 },
    { header: "Étude", key: "etude", width: 24 },
    { header: "Attribuée à", key: "assignee", width: 22 },
    { header: "Statut", key: "statut", width: 14 },
    { header: "Priorité", key: "priorite", width: 10 },
    { header: "Échéance", key: "echeance", width: 12 },
    { header: "En retard", key: "retard", width: 10 },
    { header: "Commentaire", key: "commentaire", width: 46 },
    { header: "Étapes", key: "etapes", width: 10 },
    { header: "Terminée le", key: "termineeLe", width: 12 },
  ];

  const entete = feuille.getRow(1);
  entete.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  entete.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
  entete.height = 22;

  const maintenant = Math.floor(Date.now() / 1000);

  for (const { tache, etudeNom, etudeCode, assigneNom, sousTaches } of lignes) {
    const enRetard =
      tache.statut !== "terminee" && tache.echeance && tache.echeance < maintenant;
    const etapes = sousTaches ?? [];
    const etapesFaites = etapes.filter((s) => s.faite).length;

    const ligne = feuille.addRow({
      titre: tache.titre,
      etude: etudeCode ? `${etudeCode} — ${etudeNom}` : (etudeNom ?? "Sans étude"),
      assignee: assigneNom ?? "",
      statut: LIBELLES_STATUT_MISSION[tache.statut] ?? tache.statut,
      priorite: LIBELLES_PRIORITE[tache.priorite] ?? tache.priorite,
      echeance: tache.echeance ? new Date(tache.echeance * 1000) : null,
      retard: enRetard ? "OUI" : "",
      commentaire: tache.notes ?? "",
      etapes: etapes.length === 0 ? "" : `${etapesFaites}/${etapes.length}`,
      termineeLe: tache.termineeLe ? new Date(tache.termineeLe * 1000) : null,
    });

    if (enRetard) {
      ligne.getCell("retard").font = { bold: true, color: { argb: "FFDC2626" } };
    }
  }

  feuille.getColumn("echeance").numFmt = "dd/mm/yyyy";
  feuille.getColumn("termineeLe").numFmt = "dd/mm/yyyy";
  feuille.getColumn("commentaire").alignment = { wrapText: true, vertical: "top" };

  if (lignes.length > 0) {
    feuille.autoFilter = { from: "A1", to: `J${lignes.length + 1}` };
  }

  const tampon = await classeur.xlsx.writeBuffer();
  const nomFichier = `missions-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(new Uint8Array(tampon), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nomFichier}"`,
      "Cache-Control": "no-store",
    },
  });
}
