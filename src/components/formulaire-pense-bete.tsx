"use client";

import { useId, useState } from "react";
import Modale from "./modale";
import { creerPage } from "@/actions/pages";
import { categoriesProposees } from "@/lib/pense-bete";
import type { Etude } from "@/db/schema";

export default function FormulairePenseBete({
  categories = [],
  etudes = [],
  etudeIdParDefaut,
  categorieParDefaut,
  libelle,
  variante = "principal",
}: {
  categories?: string[];
  etudes?: Pick<Etude, "id" | "nom" | "code">[];
  etudeIdParDefaut?: number;
  categorieParDefaut?: string;
  libelle: string;
  variante?: "principal" | "discret" | "compact";
}) {
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const propositions = categoriesProposees(categories);

  const classes = {
    principal: "bouton",
    discret: "bouton-discret",
    compact:
      "rounded-lg px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-accent transition hover:bg-accent-voile",
  }[variante];

  return (
    <>
      <button type="button" onClick={() => setOuverte(true)} className={classes}>
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre="Nouvelle page"
      >
        <form action={creerPage} className="space-y-4">
          {etudeIdParDefaut ? (
            <input type="hidden" name="etudeId" value={etudeIdParDefaut} />
          ) : null}
          <input type="hidden" name="icone" value="📝" />

          <div>
            <label htmlFor={`${uid}-titre`} className="mb-1.5 block text-sm font-medium">
              Titre
            </label>
            <input
              id={`${uid}-titre`}
              name="titre"
              required
              autoFocus
              placeholder="Compte rendu, liste, mode opératoire…"
              className="champ"
            />
          </div>

          <div>
            <label htmlFor={`${uid}-categorie`} className="mb-1.5 block text-sm font-medium">
              Catégorie
            </label>
            <input
              id={`${uid}-categorie`}
              name="categorie"
              list={`${uid}-cats`}
              defaultValue={categorieParDefaut ?? ""}
              placeholder="À retenir, Réunions…"
              className="champ"
            />
            <datalist id={`${uid}-cats`}>
              {propositions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-attenue">
              Choisissez une catégorie existante ou saisissez-en une nouvelle.
            </p>
          </div>

          {!etudeIdParDefaut && etudes.length > 0 && (
            <div>
              <label htmlFor={`${uid}-etude`} className="mb-1.5 block text-sm font-medium">
                Étude <span className="font-normal text-attenue">(facultatif)</span>
              </label>
              <select id={`${uid}-etude`} name="etudeId" defaultValue="" className="champ">
                <option value="">Aucune — visible seulement ici</option>
                {etudes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code ? `${e.code} — ${e.nom}` : e.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOuverte(false)} className="bouton-discret">
              Annuler
            </button>
            <button type="submit" className="bouton">
              Créer
            </button>
          </div>
        </form>
      </Modale>
    </>
  );
}
