import type { NomIcone } from "@/components/icones";
import { aPermission, type ModulePerm } from "@/lib/permissions";

export type LienNav = {
  href: string;
  libelle: string;
  icone: NomIcone;
  perm: ModulePerm;
};

export type GroupeNav = {
  titre?: string;
  liens: LienNav[];
};

/**
 * Architecture de navigation du CRMS.
 *
 * Filtrée ensuite par le rôle : un investigateur ne voit pas l'administration,
 * un Data Manager voit Data Management en premier plan, etc.
 */
export const STRUCTURE_NAV: GroupeNav[] = [
  {
    liens: [{ href: "/bord", libelle: "Tableau de bord", icone: "graphique", perm: "etudes" }],
  },
  {
    liens: [
      { href: "/etudes", libelle: "Études", icone: "dossier", perm: "etudes" },
      { href: "/centres", libelle: "Centres", icone: "personnes", perm: "centres" },
      { href: "/sujets", libelle: "Sujets", icone: "personnes", perm: "sujets" },
      { href: "/calendrier", libelle: "Visites", icone: "chrono", perm: "visites" },
    ],
  },
  {
    titre: "Data Management",
    liens: [
      { href: "/data-management", libelle: "Vue d'ensemble", icone: "graphique", perm: "dm" },
      { href: "/data-management/review", libelle: "Data Review", icone: "checklist", perm: "dm" },
      { href: "/data-management/queries", libelle: "Queries", icone: "question", perm: "queries" },
      { href: "/data-management/crf", libelle: "CRF", icone: "document", perm: "crf" },
      { href: "/data-management/coding", libelle: "Coding", icone: "page", perm: "coding" },
    ],
  },
  {
    titre: "Monitoring",
    liens: [
      { href: "/visites", libelle: "Visites ARC", icone: "bouclier", perm: "monitoring" },
      { href: "/ecarts", libelle: "Déviations", icone: "drapeau", perm: "deviations" },
      { href: "/actions", libelle: "CAPA", icone: "eclair", perm: "capa" },
    ],
  },
  {
    titre: "Qualité & documents",
    liens: [
      { href: "/documents", libelle: "Documents", icone: "document", perm: "documents" },
      { href: "/safety", libelle: "Safety", icone: "bouclier", perm: "safety" },
      { href: "/missions", libelle: "Tâches", icone: "drapeau", perm: "taches" },
    ],
  },
  {
    titre: "Pilotage",
    liens: [
      { href: "/calendrier-global", libelle: "Calendrier", icone: "chrono", perm: "calendrier" },
      { href: "/indicateurs", libelle: "Reporting", icone: "graphique", perm: "reporting" },
      { href: "/portefeuille", libelle: "Portefeuille", icone: "personnes", perm: "equipe" },
      { href: "/temps", libelle: "Temps", icone: "chrono", perm: "taches" },
      { href: "/budget", libelle: "Budget", icone: "document", perm: "etudes" },
      { href: "/faq", libelle: "Base de connaissance", icone: "question", perm: "etudes" },
    ],
  },
];

export function navigationPour(
  role: string,
  superAdmin = false,
): GroupeNav[] {
  return STRUCTURE_NAV.map((g) => ({
    ...g,
    liens: g.liens.filter((l) => aPermission(role, l.perm, "lire", superAdmin)),
  })).filter((g) => g.liens.length > 0);
}
