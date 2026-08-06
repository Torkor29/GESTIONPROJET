"use client";

import { useEffect, useState, useTransition } from "react";
import { definirStatutVisite } from "@/actions/visites";
import { STATUTS_VISITE } from "@/lib/constantes";

/**
 * Une visite progresse : planifiée → réalisée → rapport → lettre → clôturée.
 * La couleur suit cette progression plutôt qu'un simple bon/mauvais.
 */
const COULEURS: Record<string, string> = {
  planifiee: "text-attenue",
  realisee: "text-info",
  rapport_redige: "text-info",
  lettre_envoyee: "text-info",
  cloturee: "text-reussite",
  annulee: "text-efface",
};

const PASTILLES: Record<string, string> = {
  planifiee: "bg-efface",
  realisee: "bg-info",
  rapport_redige: "bg-info",
  lettre_envoyee: "bg-info",
  cloturee: "bg-reussite",
  annulee: "bg-ligne-forte",
};

/**
 * Statut modifiable directement depuis le tableau.
 *
 * L'action est appelée dans une transition plutôt que via `<form action>` :
 * React 19 réinitialise un formulaire après son action, ce qui ferait
 * réapparaître l'ancien statut à l'écran juste après l'enregistrement.
 */
export default function SelecteurStatutVisite({ id, statut }: { id: number; statut: string }) {
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
        disabled={enCours}
        aria-label="Statut de la visite"
        onChange={(e) => {
          const choix = e.target.value;
          setValeur(choix);
          demarrer(async () => {
            try {
              await definirStatutVisite(id, choix);
            } catch {
              // L'enregistrement a échoué : on revient à l'état du serveur
              // plutôt que d'afficher un statut qui n'existe pas en base.
              setValeur(statut);
            }
          });
        }}
        className={`cursor-pointer appearance-none bg-transparent text-xs font-medium outline-none
                    disabled:opacity-60 ${COULEURS[valeur] ?? "text-attenue"}`}
      >
        {Object.entries(STATUTS_VISITE).map(([v, l]) => (
          <option key={v} value={v} className="text-encre">
            {l}
          </option>
        ))}
      </select>
    </span>
  );
}
