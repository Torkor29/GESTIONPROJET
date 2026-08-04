"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { seConnecter } from "@/actions/session";

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton w-full" disabled={pending}>
      {pending ? "Vérification…" : "Se connecter"}
    </button>
  );
}

export default function FormulaireConnexion() {
  const [etat, action] = useActionState(seConnecter, {});

  return (
    <form action={action} className="carte space-y-4 p-6">
      <div>
        <label htmlFor="motDePasse" className="mb-1.5 block text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="champ"
        />
      </div>

      {etat.erreur && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {etat.erreur}
        </p>
      )}

      <BoutonEnvoyer />
    </form>
  );
}
