"use client";

import { useActionState, useState } from "react";
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
  const [email, setEmail] = useState(etat.valeurs?.email ?? "");

  return (
    <form action={action} className="carte space-y-4 p-6 !shadow-douce">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Adresse électronique professionnelle
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
          Mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
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
