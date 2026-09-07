"use client";

import Link from "next/link";
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
  // Piloté par l'état : React 19 vide le formulaire après chaque tentative,
  // et retaper son adresse à chaque essai serait pénible.
  const [email, setEmail] = useState(etat.valeurs?.email ?? "");

  return (
    <form action={action} className="carte space-y-4 p-6 !shadow-douce">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Adresse électronique
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
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label htmlFor="motDePasse" className="text-sm font-medium">
            Mot de passe
          </label>
          <Link
            href="/mot-de-passe-oublie"
            className="text-xs text-efface transition-opacity hover:opacity-60"
          >
            Oublié ?
          </Link>
        </div>
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
