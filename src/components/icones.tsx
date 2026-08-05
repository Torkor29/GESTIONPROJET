/**
 * Jeu d'icônes de l'application, dessinées en traits de 1,5 px sur une grille
 * de 24. Elles héritent de la couleur du texte environnant (`currentColor`),
 * donc s'adaptent au thème clair comme sombre sans réglage.
 */

const traces = {
  dossier: "M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2a2 2 0 0 1 1.6.8l1 1.4h7.2A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z",
  checklist: "M9 6h11M9 12h11M9 18h11M4 6l1.2 1.2L7.5 4.8M4 12l1.2 1.2L7.5 10.8M4 18l1.2 1.2L7.5 16.8",
  drapeau: "M5 21V4.5M5 4.5h11.5l-1.6 3.2 1.6 3.2H5",
  document: "M13 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V8zM13 3v5h5M9.5 13h5M9.5 17h5",
  question: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.4M12 17h.01",
  page: "M5 4.5A1.5 1.5 0 0 1 6.5 3h7L19 8.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5zM13 3v5h5M8.5 12.5h7M8.5 16h4",
  chrono: "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 9v4l2.5 1.6M9.5 2.5h5",
  bouclier: "M12 3l7.5 3v5.6c0 4.3-3.1 7.7-7.5 8.9-4.4-1.2-7.5-4.6-7.5-8.9V6z",
  graphique: "M4 20h16M7.5 20v-5.5M12 20V8M16.5 20v-9",
  fleche: "M5 12h13.5M13 6.5l5.5 5.5-5.5 5.5",
  personnes: "M15.5 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.9a3.4 3.4 0 0 0-3.4 3.4V20M9.5 11.6a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6ZM20.5 20v-1.6a3.4 3.4 0 0 0-2.5-3.3M16 5.2a3.3 3.3 0 0 1 0 6.4",
  eclair: "M13.5 3 5 13.5h6L10.5 21 19 10.5h-6z",
} as const;

export type NomIcone = keyof typeof traces;

export function Icone({
  nom,
  className = "h-5 w-5",
}: {
  nom: NomIcone;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={traces[nom]} />
    </svg>
  );
}
