"use client";

import { useEffect, useState, useTransition } from "react";
import { definirNoteLigneMission } from "@/actions/taches";

/**
 * Commentaire d'une étude au sein d'une mission multi-études, modifiable sur
 * place : on tape, on quitte le champ, c'est enregistré. Sur vingt études, un
 * formulaire par ligne serait intenable.
 */
export default function NoteLigneMission({
  id,
  notes,
  etude,
}: {
  id: number;
  notes: string | null;
  etude: string;
}) {
  const [valeur, setValeur] = useState(notes ?? "");
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState(false);

  useEffect(() => setValeur(notes ?? ""), [notes]);

  const enregistrer = () => {
    if (valeur.trim() === (notes ?? "").trim()) return;
    demarrer(async () => {
      try {
        await definirNoteLigneMission(id, valeur);
        setErreur(false);
      } catch {
        setErreur(true);
      }
    });
  };

  return (
    <input
      value={valeur}
      onChange={(e) => setValeur(e.target.value)}
      onBlur={enregistrer}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          setValeur(notes ?? "");
          e.currentTarget.blur();
        }
      }}
      disabled={enCours}
      placeholder="Ajouter un commentaire…"
      aria-label={`Commentaire pour ${etude}`}
      title={erreur ? "Échec de l'enregistrement — réessayez." : undefined}
      className={`w-full min-w-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-xs
                  text-attenue outline-none transition placeholder:text-efface
                  hover:border-ligne focus:border-accent focus:bg-relief focus:text-encre
                  disabled:opacity-60 ${erreur ? "border-alerte" : ""}`}
    />
  );
}
