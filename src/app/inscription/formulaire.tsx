"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { sInscrire } from "@/actions/session";
import { LONGUEUR_MOT_DE_PASSE } from "@/lib/constantes";

const ROLES = [
  { cle: "arc", titre: "ARC", detail: "Attaché de recherche clinique" },
  { cle: "tec", titre: "TEC", detail: "Technicien d'étude clinique" },
  { cle: "cp", titre: "CP", detail: "Chef de projet" },
  { cle: "autre", titre: "Autre", detail: "Je préciserai plus tard" },
];

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton w-full" disabled={pending}>
      {pending ? "Création…" : "Créer mon compte"}
    </button>
  );
}

export default function FormulaireInscription() {
  const [etat, action] = useActionState(sInscrire, {});

  // Champs pilotés par l'état : React 19 réinitialise le formulaire après
  // chaque exécution de l'action, ce qui viderait tout à la moindre erreur.
  // Les mots de passe, eux, restent non pilotés — les vider est souhaitable.
  const [nom, setNom] = useState(etat.valeurs?.nom ?? "");
  const [email, setEmail] = useState(etat.valeurs?.email ?? "");
  const [role, setRole] = useState(etat.valeurs?.role ?? "arc");

  return (
    <form action={action} className="carte space-y-4 p-6 !shadow-douce">
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
          placeholder="Marie Dupont"
        />
      </div>

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
          autoComplete="email"
          required
          className="champ"
          placeholder="marie.dupont@chu-brest.fr"
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

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Votre métier</legend>
        <p className="mb-2.5 text-xs text-efface">
          Sert à vous proposer les parties de l&apos;outil qui vont avec.
          Modifiable à tout moment.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <label
              key={r.cle}
              className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-ligne bg-surface p-3 transition-all duration-200 hover:border-ligne-forte has-[:checked]:border-accent has-[:checked]:bg-accent-voile/50"
            >
              <input
                type="radio"
                name="role"
                value={r.cle}
                checked={role === r.cle}
                onChange={() => setRole(r.cle)}
                className="mt-0.5 accent-accent"
              />
              <span className="min-w-0">
                <span className="block font-titre text-sm font-bold">{r.titre}</span>
                <span className="block text-xs leading-snug text-attenue">{r.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="cle" className="mb-1.5 block text-sm font-medium">
          Clé d&apos;installation
        </label>
        <input id="cle" name="cle" type="password" required className="champ" />
        <p className="mt-1.5 text-xs text-efface">
          C&apos;est la valeur <code className="font-mono">MOT_DE_PASSE</code> de votre
          fichier <code className="font-mono">.env</code>, sur le serveur.
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
