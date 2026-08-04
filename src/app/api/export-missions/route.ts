import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { estConnecte } from "@/lib/auth";
import { LIBELLES_STATUT_MISSION } from "@/lib/constantes";
import { LIBELLES_PRIORITE } from "@/lib/format";
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
  const lignes = toutes.filter(({ tache }) => {
    if (etudeId && tache.etudeId !== etudeId) return false;
    if (statut && tache.statut !== statut) return false;
    if (masquerTerminees && tache.statut === "terminee") return false;
    if (recherche) {
      const texte = `${tache.titre} ${tache.notes ?? ""}`.toLowerCase();
      if (!texte.includes(recherche)) return false;
    }
    return true;
  });

  const classeur = new ExcelJS.Workbook();
  classeur.creator = "Gestion de projet";
  classeur.created = new Date();

  const feuille = classeur.addWorksheet("Missions", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  feuille.columns = [
    { header: "Mission", key: "titre", width: 52 },
    { header: "Étude", key: "etude", width: 24 },
    { header: "Statut", key: "statut", width: 14 },
    { header: "Priorité", key: "priorite", width: 10 },
    { header: "Échéance", key: "echeance", width: 12 },
    { header: "En retard", key: "retard", width: 10 },
    { header: "Commentaire", key: "commentaire", width: 46 },
    { header: "Terminée le", key: "termineeLe", width: 12 },
  ];

  const entete = feuille.getRow(1);
  entete.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  entete.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
  entete.height = 22;

  const maintenant = Math.floor(Date.now() / 1000);

  for (const { tache, etudeNom, etudeCode } of lignes) {
    const enRetard =
      tache.statut !== "terminee" && tache.echeance && tache.echeance < maintenant;

    const ligne = feuille.addRow({
      titre: tache.titre,
      etude: etudeCode ? `${etudeCode} — ${etudeNom}` : (etudeNom ?? "Sans étude"),
      statut: LIBELLES_STATUT_MISSION[tache.statut] ?? tache.statut,
      priorite: LIBELLES_PRIORITE[tache.priorite] ?? tache.priorite,
      echeance: tache.echeance ? new Date(tache.echeance * 1000) : null,
      retard: enRetard ? "OUI" : "",
      commentaire: tache.notes ?? "",
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
    feuille.autoFilter = { from: "A1", to: `H${lignes.length + 1}` };
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
