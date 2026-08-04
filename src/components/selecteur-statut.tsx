"use client";

import { useEffect, useState, useTransition } from "react";
import { definirStatutTache } from "@/actions/taches";
import { LIBELLES_STATUT_MISSION } from "@/lib/constantes";

const COULEURS: Record<string, string> = {
  a_faire: "text-red-600 dark:text-red-400",
  en_cours: "text-blue-600 dark:text-blue-400",
  terminee: "text-emerald-600 dark:text-emerald-400",
};

const PASTILLES: Record<string, string> = {
  a_faire: "bg-red-500",
  en_cours: "bg-blue-500",
  terminee: "bg-emerald-500",
};

/**
 * Statut modifiable directement depuis le tableau, sans ouvrir de formulaire.
 *
 * L'action est appelée dans une transition plutôt que via `<form action>` :
 * React 19 réinitialise un formulaire après son action, ce qui faisait
 * réapparaître l'ancien statut à l'écran juste après l'enregistrement.
 */
export default function SelecteurStatut({ id, statut }: { id: number; statut: string }) {
  const [valeur, setValeur] = useState(statut);
  const [enCours, demarrer] = useTransition();

  // Se recale sur la valeur du serveur dès qu'elle arrive.
  useEffect(() => setValeur(statut), [statut]);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${PASTILLES[valeur] ?? "bg-stone-400"}`}
      />
      <select
        value={valeur}
        disabled={enCours}
        aria-label="Statut de la mission"
        onChange={(e) => {
          const choix = e.target.value;
          setValeur(choix);
          demarrer(async () => {
            try {
              await definirStatutTache(id, choix);
            } catch {
              // L'enregistrement a échoué : on revient à l'état du serveur
              // plutôt que d'afficher un statut qui n'existe pas en base.
              setValeur(statut);
            }
          });
        }}
        className={`cursor-pointer appearance-none bg-transparent text-xs font-medium outline-none
                    disabled:opacity-60 ${COULEURS[valeur] ?? "text-muted"}`}
      >
        {Object.entries(LIBELLES_STATUT_MISSION).map(([v, l]) => (
          <option key={v} value={v} className="text-ink">
            {l}
          </option>
        ))}
      </select>
    </span>
  );
}
