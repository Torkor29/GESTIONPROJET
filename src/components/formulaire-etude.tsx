"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerEtude, modifierEtude } from "@/actions/etudes";
import { VIDE } from "@/actions/etat";
import type { Etude } from "@/db/schema";
import { LIBELLES_STATUT_ETUDE } from "@/lib/format";

const COULEURS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#78716c",
];

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

export default function FormulaireEtude({
  etude,
  libelle,
  variante = "principal",
}: {
  etude?: Etude;
  libelle: string;
  variante?: "principal" | "discret";
}) {
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(etude);
  const [etat, action] = useActionState(edition ? modifierEtude : creerEtude, VIDE);

  // La création redirige ; seule la modification a besoin de refermer la modale.
  const succesVu = useRef(0);
  useEffect(() => {
    const s = etat.succes ?? 0;
    if (s > succesVu.current) {
      succesVu.current = s;
      setOuverte(false);
    }
  }, [etat.succes]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        className={variante === "principal" ? "bouton" : "bouton-discret"}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier l'étude" : "Nouvelle étude"}
      >
        <form action={action} className="space-y-4">
          {edition && <input type="hidden" name="id" value={etude!.id} />}

          <div>
            <label htmlFor="nom" className="mb-1.5 block text-sm font-medium">
              Nom de l&apos;étude
            </label>
            <input
              id="nom"
              name="nom"
              required
              autoFocus
              defaultValue={etude?.nom}
              placeholder="Réhabilitation site Nord"
              className="champ"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="client" className="mb-1.5 block text-sm font-medium">
                Client <span className="font-normal text-muted">(facultatif)</span>
              </label>
              <input
                id="client"
                name="client"
                defaultValue={etude?.client ?? ""}
                className="champ"
              />
            </div>
            <div>
              <label htmlFor="tarifHoraire" className="mb-1.5 block text-sm font-medium">
                Tarif horaire <span className="font-normal text-muted">(€/h)</span>
              </label>
              <input
                id="tarifHoraire"
                name="tarifHoraire"
                inputMode="decimal"
                defaultValue={etude?.tarifHoraire ?? ""}
                placeholder="75"
                className="champ"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
              Description <span className="font-normal text-muted">(facultatif)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={etude?.description ?? ""}
              className="champ resize-y"
            />
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Couleur</legend>
            <div className="flex flex-wrap gap-2">
              {COULEURS.map((c, i) => (
                <label key={c} className="cursor-pointer">
                  <input
                    type="radio"
                    name="couleur"
                    value={c}
                    defaultChecked={etude ? etude.couleur === c : i === 0}
                    className="peer sr-only"
                  />
                  <span
                    className="block h-7 w-7 rounded-full ring-offset-2 ring-offset-raised transition
                               peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2"
                    style={{ backgroundColor: c }}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          {edition && (
            <div>
              <label htmlFor="statut" className="mb-1.5 block text-sm font-medium">
                Statut
              </label>
              <select id="statut" name="statut" defaultValue={etude!.statut} className="champ">
                {Object.entries(LIBELLES_STATUT_ETUDE).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}

          {etat.erreur && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {etat.erreur}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOuverte(false)} className="bouton-discret">
              Annuler
            </button>
            <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Créer l'étude"} />
          </div>
        </form>
      </Modale>
    </>
  );
}
