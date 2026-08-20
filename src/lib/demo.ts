/** Identifiants du jeu de démonstration — lisibles côté client (page admin). */

export const MOT_DE_PASSE_DEMO = "DemoVigie2026!";

export const COMPTES_DEMO = [
  {
    email: "julia.martin@demo.vigie.local",
    nom: "Julia Martin",
    role: "chef_projet",
    superAdmin: true,
  },
  {
    email: "lucas.bernard@demo.vigie.local",
    nom: "Lucas Bernard",
    role: "data_manager",
    superAdmin: false,
  },
  {
    email: "lea.moreau@demo.vigie.local",
    nom: "Léa Moreau",
    role: "arc",
    superAdmin: false,
  },
  {
    email: "nicolas.petit@demo.vigie.local",
    nom: "Nicolas Petit",
    role: "investigateur",
    superAdmin: false,
  },
  {
    email: "claire.dupont@demo.vigie.local",
    nom: "Claire Dupont",
    role: "lecture_seule",
    superAdmin: false,
  },
] as const;
