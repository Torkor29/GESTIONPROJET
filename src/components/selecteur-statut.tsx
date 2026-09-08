"use client";

import { useEffect, useState, useTransition } from "react";
import { definirStatutTache } from "@/actions/taches";
import { LIBELLES_STATUT_MISSION } from "@/lib/constantes";

const COULEURS: Record<string, string> = {
  a_faire: "text-alerte",
  en_cours: "text-info",
  terminee: "text-reussite",
};

const PASTILLES: Record<string, string> = {
  a_faire: "bg-alerte",
  en_cours: "bg-info",
  terminee: "bg-reussite",
};

/**
 * Statut modifiable directement depuis le tableau, sans ouvrir de formulaire.
 *
 * L'action est appelée dans une transition plutôt que via `<form action>` :
 * React 19 réinitialise un formulaire après son action, ce qui faisait
 * réapparaître l'ancien statut à l'écran juste après l'enregistrement.
 */
export default function SelecteurStatut({
  id,
  statut,
  verrouille = false,
}: {
  id: number;
  statut: string;
  /** Le statut suit les étapes : on l'affiche, on ne le change plus à la main. */
  verrouille?: boolean;
}) {
  const [valeur, setValeur] = useState(statut);
  const [enCours, demarrer] = useTransition();

  // Se recale sur la valeur du serveur dès qu'elle arrive.
  useEffect(() => setValeur(statut), [statut]);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${PASTILLES[valeur] ?? "bg-efface"}`}
      />
      <select
        value={valeur}
        disabled={enCours || verrouille}
        aria-label="Statut de la mission"
        title={
          verrouille
            ? "Le statut suit les étapes : en cours tant qu'il en reste, terminée quand toutes sont cochées."
            : undefined
        }
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
        className={`${verrouille ? "cursor-default" : "cursor-pointer"} appearance-none bg-transparent text-xs font-medium outline-none
                    disabled:opacity-80 ${COULEURS[valeur] ?? "text-attenue"}`}
      >
        {Object.entries(LIBELLES_STATUT_MISSION).map(([v, l]) => (
          <option key={v} value={v} className="text-encre">
            {l}
          </option>
        ))}
      </select>
    </span>
  );
}
