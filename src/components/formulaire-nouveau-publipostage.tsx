"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerPublipostage } from "@/actions/publipostage";
import { VIDE } from "@/actions/etat";
import type { Etude } from "@/db/schema";
import { MODELES_PUBLIPOSTAGE } from "@/lib/publipostage";

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Création…" : "Créer et compléter"}
    </button>
  );
}

/**
 * Premier pas d'un document : le modèle et l'étude. Les champs viennent
 * ensuite, sur la page du document — la fiche de qualification en compte
 * trop pour tenir dans une fenêtre.
 */
export default function FormulaireNouveauPublipostage({
  etudes,
  etudeIdParDefaut,
  libelle = "Nouveau document",
  variante = "principal",
}: {
  etudes: Pick<Etude, "id" | "nom" | "code">[];
  etudeIdParDefaut?: number;
  libelle?: string;
  variante?: "principal" | "discret";
}) {
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const [etat, envoyer] = useActionState(creerPublipostage, VIDE);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        className={variante === "principal" ? "bouton" : "bouton-discret"}
      >
        {libelle}
      </button>

      <Modale ouverte={ouverte} onFermer={() => setOuverte(false)} titre="Nouveau document" large>
        <form action={envoyer} className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Modèle</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {MODELES_PUBLIPOSTAGE.map((m, i) => (
                <label
                  key={m.cle}
                  className="flex cursor-pointer gap-3 rounded-xl border border-ligne bg-relief p-3.5 transition-all duration-200
                             hover:border-ligne-forte has-[:checked]:border-accent has-[:checked]:bg-accent-voile/40"
                >
                  <input
                    type="radio"
                    name="modele"
                    value={m.cle}
                    defaultChecked={i === 0}
                    required
                    className="mt-1 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{m.nom}</span>
                    <span className="block text-xs text-efface">{m.reference}</span>
                    <span className="mt-1 block text-xs text-attenue">{m.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-etude`} className="mb-1.5 block text-sm font-medium">
                Étude
              </label>
              <select
                id={`${uid}-etude`}
                name="etudeId"
                defaultValue={etudeIdParDefaut ? String(etudeIdParDefaut) : ""}
                className="champ"
              >
                <option value="">Sans étude</option>
                {etudes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code ? `${e.code} — ${e.nom}` : e.nom}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-attenue">
                Acronyme, promoteur, investigateur et identifiants seront repris de la fiche étude.
              </p>
            </div>

            <div>
              <label htmlFor={`${uid}-titre`} className="mb-1.5 block text-sm font-medium">
                Titre <span className="font-normal text-efface">(facultatif)</span>
              </label>
              <input
                id={`${uid}-titre`}
                name="titre"
                className="champ"
                placeholder="Proposé à partir du modèle et de l'étude"
              />
            </div>
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}

          <BoutonEnvoyer />
        </form>
      </Modale>
    </>
  );
}
