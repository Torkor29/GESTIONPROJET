import { formaterDate, LIBELLES_PRIORITE } from "./format";
import { NOM_PRODUIT } from "./site";

export type MissionPourCourrier = {
  destinataireNom: string;
  parNom: string;
  titre: string;
  notes?: string | null;
  priorite: string;
  echeance: number | null;
  etudes: { nom: string; code: string | null }[];
  href: string;
};

/** Sujet et corps en texte brut, lisibles dans n'importe quelle messagerie. */
export function redigerCourrierAttribution(m: MissionPourCourrier): {
  sujet: string;
  texte: string;
} {
  const etudes =
    m.etudes.length === 0
      ? "—"
      : m.etudes.map((e) => (e.code ? `${e.code} — ${e.nom}` : e.nom)).join("\n  ");
  const priorite = LIBELLES_PRIORITE[m.priorite] ?? m.priorite;
  const commentaire = (m.notes ?? "").trim();

  const lignes = [
    `Bonjour ${m.destinataireNom},`,
    "",
    `${m.parNom} vous a attribué une mission.`,
    "",
    `Mission : ${m.titre}`,
    m.etudes.length > 1 ? `Études :\n  ${etudes}` : `Étude : ${etudes}`,
    `Échéance : ${formaterDate(m.echeance)}`,
    `Priorité : ${priorite}`,
  ];
  if (commentaire) {
    lignes.push("", "Commentaire :", commentaire);
  }
  lignes.push("", "Ouvrir la mission :", m.href, "", `—`, NOM_PRODUIT);

  return {
    sujet: `Mission attribuée : ${m.titre}`,
    texte: lignes.join("\n"),
  };
}
