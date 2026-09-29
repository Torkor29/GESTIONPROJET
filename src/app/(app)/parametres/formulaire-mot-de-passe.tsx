"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changerMotDePasse } from "@/actions/session";
import { LONGUEUR_MOT_DE_PASSE } from "@/lib/constantes";

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton-discret" disabled={pending}>
      {pending ? "Enregistrement…" : "Changer le mot de passe"}
    </button>
  );
}

export default function FormulaireChangerMotDePasse() {
  const [etat, action] = useActionState(changerMotDePasse, {});

  return (
    <form action={action} className="mt-4 max-w-md space-y-4">
      <div>
        <label htmlFor="actuel" className="mb-1.5 block text-sm font-medium">
          Mot de passe actuel
        </label>
        <input
          id="actuel"
          name="actuel"
          type="password"
          autoComplete="current-password"
          required
          className="champ"
        />
      </div>
      <div>
        <label htmlFor="nouveauMotDePasse" className="mb-1.5 block text-sm font-medium">
          Nouveau mot de passe
        </label>
        <input
          id="nouveauMotDePasse"
          name="nouveau"
          type="password"
          autoComplete="new-password"
          required
          minLength={LONGUEUR_MOT_DE_PASSE}
          className="champ"
        />
        <p className="mt-1.5 text-xs text-efface">
          {LONGUEUR_MOT_DE_PASSE} caractères minimum.
        </p>
      </div>
      <div>
        <label htmlFor="confirmation" className="mb-1.5 block text-sm font-medium">
          Confirmer le nouveau mot de passe
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
          minLength={LONGUEUR_MOT_DE_PASSE}
          className="champ"
        />
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

      <BoutonEnvoyer />
    </form>
  );
}
