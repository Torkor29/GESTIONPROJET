"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { ajouterTemps, modifierTemps } from "@/actions/temps";
import { VIDE } from "@/actions/etat";
import type { Etude, Temps } from "@/db/schema";
import { versChampDate } from "@/lib/format";

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

function heureDe(secondes: number): string {
  const d = new Date(secondes * 1000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function FormulaireTemps({
  entree,
  etudes,
  etudeIdParDefaut,
  libelle,
  variante = "principal",
}: {
  entree?: Temps;
  etudes: Pick<Etude, "id" | "nom">[];
  etudeIdParDefaut?: number;
  libelle: string;
  variante?: "principal" | "discret" | "icone";
}) {
  // Plusieurs de ces formulaires cohabitent sur une même page : les identifiants
  // doivent être uniques, sinon les libellés pointent vers le mauvais champ.
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(entree);
  const [etat, action] = useActionState(edition ? modifierTemps : ajouterTemps, VIDE);

  const succesVu = useRef(0);
  useEffect(() => {
    const s = etat.succes ?? 0;
    if (s > succesVu.current) {
      succesVu.current = s;
      setOuverte(false);
    }
  }, [etat.succes]);

  const classes = {
    principal: "bouton",
    discret: "bouton-discret",
    icone: "rounded-lg px-2 py-1 text-sm text-attenue transition hover:bg-creux hover:text-accent",
  }[variante];

  const dureeInitiale =
    entree && entree.fin ? `${Math.round((entree.fin - entree.debut) / 60)}min` : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        title={edition ? "Modifier la saisie" : undefined}
        aria-label={edition ? "Modifier la saisie" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier la saisie" : "Ajouter du temps"}
      >
        <form action={action} className="space-y-4">
          {edition && <input type="hidden" name="id" value={entree!.id} />}

          <div>
            <label htmlFor={`${uid}-etudeId`} className="mb-1.5 block text-sm font-medium">
              Étude
            </label>
            <select
              id={`${uid}-etudeId`}
              name="etudeId"
              defaultValue={entree?.etudeId ?? etudeIdParDefaut ?? ""}
              className="champ"
            >
              <option value="">Sans étude</option>
              {etudes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor={`${uid}-date`} className="mb-1.5 block text-sm font-medium">
                Date
              </label>
              <input
                id={`${uid}-date`}
                name="date"
                type="date"
                required
                defaultValue={
                  entree ? versChampDate(entree.debut) : versChampDate(Date.now() / 1000)
                }
                className="champ"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-heureDebut`} className="mb-1.5 block text-sm font-medium">
                Début
              </label>
              <input
                id={`${uid}-heureDebut`}
                name="heureDebut"
                type="time"
                defaultValue={entree ? heureDe(entree.debut) : "09:00"}
                className="champ"
              />
            </div>

            <div>
              <label htmlFor={`${uid}-duree`} className="mb-1.5 block text-sm font-medium">
                Durée
              </label>
              <input
                id={`${uid}-duree`}
                name="duree"
                required
                autoFocus
                defaultValue={dureeInitiale}
                placeholder="1h30"
                className="champ"
              />
            </div>
          </div>

          <p className="-mt-2 text-xs text-attenue">
            Durée acceptée sous plusieurs formes : <code>1h30</code>, <code>1:30</code>,{" "}
            <code>90min</code>, <code>1,5</code>.
          </p>

          <div>
            <label htmlFor={`${uid}-description`} className="mb-1.5 block text-sm font-medium">
              Description <span className="font-normal text-attenue">(facultatif)</span>
            </label>
            <input
              id={`${uid}-description`}
              name="description"
              defaultValue={entree?.description ?? ""}
              placeholder="Réunion de cadrage"
              className="champ"
            />
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOuverte(false)} className="bouton-discret">
              Annuler
            </button>
            <BoutonEnvoyer libelle={edition ? "Enregistrer" : "Ajouter"} />
          </div>
        </form>
      </Modale>
    </>
  );
}
