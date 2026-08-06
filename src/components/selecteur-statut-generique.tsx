"use client";

import { useEffect, useState, useTransition } from "react";

/**
 * Statut modifiable directement depuis un tableau, sans ouvrir de formulaire.
 *
 * L'action est appelée dans une transition plutôt que via `<form action>` :
 * React 19 réinitialise un formulaire après son action, ce qui ferait
 * réapparaître l'ancien statut à l'écran juste après l'enregistrement.
 *
 * Générique parce que trois modules en ont besoin avec des jeux de statuts
 * différents ; seuls les libellés et les couleurs changent.
 */
export default function SelecteurStatutGenerique({
  id,
  statut,
  libelles,
  couleurs,
  pastilles,
  enregistrer,
  etiquette,
}: {
  id: number;
  statut: string;
  libelles: Record<string, string>;
  /** Couleur du texte par statut, en classes utilitaires. */
  couleurs: Record<string, string>;
  /** Couleur de la pastille par statut. */
  pastilles: Record<string, string>;
  /** Action serveur qui enregistre le nouveau statut. */
  enregistrer: (id: number, statut: string) => Promise<void>;
  /** Libellé accessible du sélecteur, par exemple « Statut de l'écart ». */
  etiquette: string;
}) {
  const [valeur, setValeur] = useState(statut);
  const [enCours, demarrer] = useTransition();

  // Se recale sur la valeur du serveur dès qu'elle arrive.
  useEffect(() => setValeur(statut), [statut]);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${pastilles[valeur] ?? "bg-efface"}`}
      />
      <select
        value={valeur}
        disabled={enCours}
        aria-label={etiquette}
        onChange={(e) => {
          const choix = e.target.value;
          setValeur(choix);
          demarrer(async () => {
            try {
              await enregistrer(id, choix);
            } catch {
              // L'enregistrement a échoué : on revient à l'état du serveur
              // plutôt que d'afficher un statut qui n'existe pas en base.
              setValeur(statut);
            }
          });
        }}
        className={`cursor-pointer appearance-none bg-transparent text-xs font-medium outline-none
                    disabled:opacity-60 ${couleurs[valeur] ?? "text-attenue"}`}
      >
        {Object.entries(libelles).map(([v, l]) => (
          <option key={v} value={v} className="text-encre">
            {l}
          </option>
        ))}
      </select>
    </span>
  );
}
