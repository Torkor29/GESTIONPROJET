"use client";

import { useState, useTransition } from "react";
import { agirSurQuery } from "@/actions/queries";
import type { ActionQuery } from "@/lib/queries-workflow";
import { actionsPossibles } from "@/lib/queries-workflow";

const LIBELLES: Record<ActionQuery, string> = {
  repondre: "Répondre",
  rouvrir: "Rouvrir",
  resoudre: "Résoudre",
  fermer: "Fermer",
};

export default function ActionsQuery({ id, statut }: { id: number; statut: string }) {
  const possibles = actionsPossibles(statut);
  const [commentaire, setCommentaire] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (possibles.length === 0) {
    return <p className="text-sm text-attenue">Cette query est close.</p>;
  }

  return (
    <div className="space-y-3">
      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        rows={3}
        className="champ"
        placeholder="Réponse ou commentaire de transition"
      />
      <div className="flex flex-wrap gap-2">
        {possibles.map((a) => (
          <button
            key={a}
            type="button"
            disabled={pending}
            className={a === "fermer" || a === "resoudre" ? "bouton" : "bouton-discret"}
            onClick={() =>
              start(async () => {
                const r = await agirSurQuery(id, a, commentaire);
                if (!r.ok) setErreur(r.erreur);
                else setErreur(null);
              })
            }
          >
            {LIBELLES[a]}
          </button>
        ))}
      </div>
      {erreur && <p className="text-sm text-alerte">{erreur}</p>}
    </div>
  );
}
