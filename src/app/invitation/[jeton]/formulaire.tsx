"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { accepterInvitation } from "@/actions/invitations";
import { LONGUEUR_MOT_DE_PASSE } from "@/lib/constantes";

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton w-full" disabled={pending}>
      {pending ? "Création…" : "Créer mon compte"}
    </button>
  );
}

export default function FormulaireInvitation({
  jeton,
  email,
}: {
  jeton: string;
  email: string;
}) {
  const [etat, action] = useActionState(accepterInvitation, {});
  // Piloté par l'état : React 19 vide le formulaire après chaque tentative.
  const [nom, setNom] = useState(etat.valeurs?.nom ?? "");

  return (
    <form action={action} className="carte space-y-4 p-6 !shadow-douce">
      <input type="hidden" name="jeton" value={jeton} />

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Adresse électronique
        </label>
        <input id="email" value={email} disabled className="champ opacity-70" />
        <p className="mt-1.5 text-xs text-efface">
          Fixée par l&apos;invitation : c&apos;est elle qui vous identifiera.
        </p>
      </div>

      <div>
        <label htmlFor="nom" className="mb-1.5 block text-sm font-medium">
          Votre nom
        </label>
        <input
          id="nom"
          name="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          autoFocus
          className="champ"
          placeholder="Bob Durand"
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
          autoComplete="new-password"
          required
          minLength={LONGUEUR_MOT_DE_PASSE}
          className="champ"
        />
        <p className="mt-1.5 text-xs text-efface">
          {LONGUEUR_MOT_DE_PASSE} caractères minimum.
        </p>
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
