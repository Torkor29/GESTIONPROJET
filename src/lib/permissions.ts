/**
 * Contrôle d'accès par rôle (RBAC).
 *
 * Le masquage d'un bouton dans l'interface n'est pas une autorisation :
 * chaque Server Action et chaque route API doit appeler `exigerPermission`.
 *
 * Un rôle métier (ARC, Data Manager…) détermine les modules ; le drapeau
 * `superAdmin` ouvre l'administration de l'instance, indépendamment du métier.
 */

export const ROLES = [
  "super_admin",
  "chef_projet",
  "data_manager",
  "arc",
  "tec",
  "investigateur",
  "sponsor",
  "lecture_seule",
  "cp",
  "autre",
] as const;

export type Role = (typeof ROLES)[number];

export const MODULES_PERM = [
  "etudes",
  "centres",
  "sujets",
  "visites",
  "dm",
  "queries",
  "crf",
  "coding",
  "monitoring",
  "deviations",
  "capa",
  "documents",
  "taches",
  "calendrier",
  "reporting",
  "safety",
  "equipe",
  "admin",
] as const;

export type ModulePerm = (typeof MODULES_PERM)[number];

export const ACTIONS_PERM = ["lire", "creer", "modifier", "supprimer", "exporter"] as const;
export type ActionPerm = (typeof ACTIONS_PERM)[number];

const TOUT: ActionPerm[] = ["lire", "creer", "modifier", "supprimer", "exporter"];
const LIRE: ActionPerm[] = ["lire"];
const LIRE_X: ActionPerm[] = ["lire", "exporter"];
const SAUF_SUPPR: ActionPerm[] = ["lire", "creer", "modifier", "exporter"];
const TRAVAIL: ActionPerm[] = ["lire", "creer", "modifier", "exporter"];

function toutSauf(exclus: ModulePerm[]): Partial<Record<ModulePerm, ActionPerm[]>> {
  const m: Partial<Record<ModulePerm, ActionPerm[]>> = {};
  for (const mod of MODULES_PERM) {
    if (!exclus.includes(mod)) m[mod] = TOUT;
  }
  return m;
}

/**
 * Matrice rôle × module. Absente = aucun droit.
 * `cp` est l'ancien code de chef de projet, conservé pour les comptes existants.
 */
const MATRICE: Record<string, Partial<Record<ModulePerm, ActionPerm[]>>> = {
  super_admin: Object.fromEntries(MODULES_PERM.map((m) => [m, TOUT])),
  chef_projet: {
    ...toutSauf(["admin"]),
    admin: LIRE,
  },
  cp: {
    ...toutSauf(["admin"]),
    admin: LIRE,
  },
  data_manager: {
    etudes: LIRE_X,
    centres: LIRE,
    sujets: TRAVAIL,
    visites: TRAVAIL,
    dm: TOUT,
    queries: TOUT,
    crf: TOUT,
    coding: TOUT,
    monitoring: LIRE,
    deviations: LIRE,
    capa: LIRE,
    documents: SAUF_SUPPR,
    taches: TRAVAIL,
    calendrier: LIRE,
    reporting: LIRE_X,
    safety: LIRE,
    equipe: LIRE,
  },
  arc: {
    etudes: LIRE_X,
    centres: TRAVAIL,
    sujets: TRAVAIL,
    visites: TRAVAIL,
    dm: LIRE,
    queries: SAUF_SUPPR,
    crf: LIRE,
    coding: LIRE,
    monitoring: TOUT,
    deviations: TOUT,
    capa: TRAVAIL,
    documents: SAUF_SUPPR,
    taches: TRAVAIL,
    calendrier: LIRE,
    reporting: LIRE_X,
    safety: SAUF_SUPPR,
    equipe: LIRE,
  },
  tec: {
    etudes: LIRE,
    centres: LIRE,
    sujets: TRAVAIL,
    visites: TRAVAIL,
    dm: LIRE,
    queries: ["lire", "modifier"],
    crf: ["lire", "creer", "modifier"],
    documents: ["lire", "creer"],
    taches: TRAVAIL,
    calendrier: LIRE,
    reporting: LIRE,
    safety: ["lire", "creer", "modifier"],
  },
  investigateur: {
    etudes: LIRE,
    centres: LIRE,
    sujets: ["lire", "modifier"],
    visites: ["lire", "modifier"],
    queries: ["lire", "modifier"],
    crf: ["lire", "creer", "modifier"],
    documents: LIRE,
    taches: ["lire", "modifier"],
    calendrier: LIRE,
    reporting: LIRE,
    safety: ["lire", "creer", "modifier"],
    deviations: LIRE,
    monitoring: LIRE,
    dm: LIRE,
  },
  sponsor: {
    etudes: LIRE_X,
    centres: LIRE_X,
    sujets: LIRE_X,
    visites: LIRE,
    dm: LIRE_X,
    queries: LIRE_X,
    monitoring: LIRE,
    deviations: LIRE_X,
    capa: LIRE,
    documents: LIRE,
    taches: LIRE,
    calendrier: LIRE,
    reporting: LIRE_X,
    safety: LIRE,
  },
  lecture_seule: {
    etudes: LIRE,
    centres: LIRE,
    sujets: LIRE,
    visites: LIRE,
    dm: LIRE,
    queries: LIRE,
    crf: LIRE,
    monitoring: LIRE,
    deviations: LIRE,
    capa: LIRE,
    documents: LIRE,
    taches: LIRE,
    calendrier: LIRE,
    reporting: LIRE,
    safety: LIRE,
  },
  autre: {
    etudes: LIRE,
    taches: TRAVAIL,
    documents: LIRE,
    calendrier: LIRE,
  },
};

export function normaliserRole(role: string | null | undefined): string {
  if (!role) return "autre";
  if (role === "cp") return "chef_projet";
  return role;
}

export function aPermission(
  role: string,
  module: ModulePerm,
  action: ActionPerm,
  superAdmin = false,
): boolean {
  if (superAdmin) return true;
  const droits = MATRICE[role] ?? MATRICE[normaliserRole(role)] ?? MATRICE.autre;
  return Boolean(droits[module]?.includes(action));
}

export function modulesAutorises(role: string, superAdmin = false): ModulePerm[] {
  if (superAdmin) return [...MODULES_PERM];
  const droits = MATRICE[role] ?? MATRICE[normaliserRole(role)] ?? MATRICE.autre;
  return MODULES_PERM.filter((m) => (droits[m] ?? []).includes("lire"));
}

export class RefusPermission extends Error {
  constructor(message = "Vous n'avez pas le droit d'effectuer cette action.") {
    super(message);
    this.name = "RefusPermission";
  }
}
