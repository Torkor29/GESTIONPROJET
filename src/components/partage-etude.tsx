"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { partagerEtude, retirerPartage } from "@/actions/partages";
import { Icone } from "@/components/icones";
import Modale from "@/components/modale";

export type Invite = { id: number; niveau: string; nom: string; email: string };

function BoutonPartager() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Partage…" : "Convier"}
    </button>
  );
}

export default function PartageEtude({
  etudeId,
  invites,
  comptes,
}: {
  etudeId: number;
  invites: Invite[];
  /** Comptes existants, proposés en autocomplétion pour éviter les fautes de frappe. */
  comptes: { nom: string; email: string }[];
}) {
  const [ouverte, setOuverte] = useState(false);
  const [etat, action] = useActionState(partagerEtude, {});
  const [email, setEmail] = useState("");

  return (
    <>
      <button type="button" onClick={() => setOuverte(true)} className="bouton-discret">
        <Icone nom="personnes" className="h-4 w-4" />
        Partager
        {invites.length > 0 && (
          <span className="chiffres text-xs text-attenue">({invites.length})</span>
        )}
      </button>

      <Modale ouverte={ouverte} onFermer={() => setOuverte(false)} titre="Partager cette étude">
        <form action={action} className="space-y-4">
          <input type="hidden" name="etudeId" value={etudeId} />

          <div>
            <label htmlFor="emailPartage" className="mb-1.5 block text-sm font-medium">
              Personne à convier
            </label>
            <input
              id="emailPartage"
              name="email"
              type="email"
              list="comptes-existants"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="champ"
              placeholder="collegue@chu-brest.fr"
            />
            <datalist id="comptes-existants">
              {comptes.map((c) => (
                <option key={c.email} value={c.email}>
                  {c.nom}
                </option>
              ))}
            </datalist>
            <p className="mt-1.5 text-xs text-efface">
              Elle doit déjà avoir un compte. Sinon, invitez-la depuis Modules ›
              Équipe.
            </p>
          </div>

          <div>
            <label htmlFor="niveau" className="mb-1.5 block text-sm font-medium">
              Niveau d&apos;accès
            </label>
            <select id="niveau" name="niveau" defaultValue="lecture" className="champ">
              <option value="lecture">Lecture — consulter sans modifier</option>
              <option value="ecriture">Écriture — ajouter et modifier</option>
            </select>
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}
          {etat.message && <p className="text-sm text-reussite">{etat.message}</p>}

          <BoutonPartager />
        </form>

        {invites.length > 0 && (
          <div className="mt-6 border-t border-ligne pt-5">
            <h3 className="sur-titre mb-3">Personnes conviées</h3>
            <ul className="space-y-2">
              {invites.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ligne bg-surface px-3.5 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{i.nom}</span>
                    <span className="block truncate text-xs text-efface">
                      {i.email} · {i.niveau === "ecriture" ? "écriture" : "lecture"}
                    </span>
                  </span>
                  <form action={retirerPartage}>
                    <input type="hidden" name="id" value={i.id} />
                    <button
                      type="submit"
                      title="Retirer l'accès"
                      aria-label={`Retirer l'accès de ${i.nom}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-attenue transition-all duration-200 hover:bg-creux hover:text-alerte active:scale-95"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                        className="h-4 w-4"
                        aria-hidden
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modale>
    </>
  );
}
