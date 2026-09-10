"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { viderArchives, type EtatArchives } from "@/actions/taches";

function Boutons() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-2">
      <button type="submit" className="bouton-discret" disabled={pending}>
        {pending ? "Retrait…" : "Vider jusqu'à cette date"}
      </button>
      <button type="submit" name="tout" value="1" className="bouton-discret" disabled={pending}>
        Tout vider
      </button>
    </div>
  );
}

export default function ViderArchives() {
  const [etat, action] = useActionState(viderArchives, {} as EtatArchives);

  return (
    <form action={action} className="bloc-app space-y-3">
      <div>
        <h2 className="font-titre text-lg font-bold">Vider les archives</h2>
        <p className="mt-1 text-sm text-attenue">
          Après le point, retirez ce qui a déjà été vu. Le temps saisi n&apos;est pas
          effacé. Sans date, tout part.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="avant" className="mb-1.5 block text-xs text-attenue">
            Terminées le… ou avant
          </label>
          <input id="avant" name="avant" type="date" className="champ" />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" name="confirmer" value="1" className="h-4 w-4 accent-indigo-600" />
          Retirer définitivement
        </label>
        <Boutons />
      </div>
      {etat.erreur && (
        <p role="alert" className="text-sm text-alerte">
          {etat.erreur}
        </p>
      )}
      {etat.message && (
        <p role="status" className="text-sm text-reussite">
          {etat.message}
        </p>
      )}
    </form>
  );
}
