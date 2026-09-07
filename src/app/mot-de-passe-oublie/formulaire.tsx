"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { reinitialiserMotDePasse } from "@/actions/session";
import { LONGUEUR_MOT_DE_PASSE } from "@/lib/constantes";

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton w-full" disabled={pending}>
      {pending ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
    </button>
  );
}

export default function FormulaireMotDePasseOublie() {
  const [etat, action] = useActionState(reinitialiserMotDePasse, {});
  const [email, setEmail] = useState(etat.valeurs?.email ?? "");

  return (
    <form action={action} className="carte space-y-4 p-6 !shadow-douce">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Adresse électronique du compte
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          autoFocus
          required
          className="champ"
        />
      </div>

      <div>
        <label htmlFor="motDePasse" className="mb-1.5 block text-sm font-medium">
          Nouveau mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
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

      <BoutonEnvoyer />
    </form>
  );
}
