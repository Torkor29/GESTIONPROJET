"use client";

import { useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerModeleVisite, supprimerModeleVisite } from "@/actions/sujets";
import { VIDE } from "@/actions/etat";
import { TYPES_MODELE_VISITE } from "@/lib/constantes";

function Envoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Ajouter au calendrier"}
    </button>
  );
}

export default function FormulaireModeleVisite({
  etudeId,
  prochainOrdre,
  libelle = "+ Visite protocolaire",
}: {
  etudeId: number;
  prochainOrdre: number;
  libelle?: string;
}) {
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const [etat, action] = useActionState(creerModeleVisite, VIDE);
  const vu = useRef(0);
  useEffect(() => {
    const s = etat.succes ?? 0;
    if (s > vu.current) {
      vu.current = s;
      setOuverte(false);
    }
  }, [etat.succes]);

  return (
    <>
      <button type="button" onClick={() => setOuverte(true)} className="bouton-discret">
        {libelle}
      </button>
      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre="Visite du calendrier protocolaire"
      >
        <form action={action} className="space-y-4">
          <input type="hidden" name="etudeId" value={etudeId} />
          <p className="text-sm text-attenue">
            Ces visites se recopient sur chaque sujet à l&apos;inclusion (Subject ID).
            Pas de nom de patient ici.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-code`} className="mb-1.5 block text-sm font-medium">
                Code
              </label>
              <input
                id={`${uid}-code`}
                name="code"
                required
                placeholder="V1"
                className="champ"
              />
            </div>
            <div>
              <label htmlFor={`${uid}-nom`} className="mb-1.5 block text-sm font-medium">
                Nom
              </label>
              <input
                id={`${uid}-nom`}
                name="nom"
                required
                placeholder="Visite d'inclusion"
                className="champ"
              />
            </div>
          </div>
          <div>
            <label htmlFor={`${uid}-type`} className="mb-1.5 block text-sm font-medium">
              Type
            </label>
            <select id={`${uid}-type`} name="type" className="champ" defaultValue="traitement">
              {Object.entries(TYPES_MODELE_VISITE).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor={`${uid}-ordre`} className="mb-1.5 block text-sm font-medium">
                Ordre
              </label>
              <input
                id={`${uid}-ordre`}
                name="ordre"
                type="number"
                defaultValue={prochainOrdre}
                className="champ"
              />
            </div>
            <div>
              <label htmlFor={`${uid}-min`} className="mb-1.5 block text-sm font-medium">
                Jours (min)
              </label>
              <input
                id={`${uid}-min`}
                name="fenetreMin"
                type="number"
                placeholder="0"
                className="champ"
              />
            </div>
            <div>
              <label htmlFor={`${uid}-max`} className="mb-1.5 block text-sm font-medium">
                Jours (max)
              </label>
              <input
                id={`${uid}-max`}
                name="fenetreMax"
                type="number"
                placeholder="7"
                className="champ"
              />
            </div>
          </div>
          {etat.erreur && (
            <p role="alert" className="text-sm text-alerte">
              {etat.erreur}
            </p>
          )}
          <Envoyer />
        </form>
      </Modale>
    </>
  );
}

export function BoutonRetirerModeleVisite({ id }: { id: number }) {
  const [enCours, demarrer] = useTransition();
  return (
    <button
      type="button"
      disabled={enCours}
      onClick={() => demarrer(() => supprimerModeleVisite(id))}
      className="text-xs text-attenue hover:text-alerte disabled:opacity-50"
    >
      {enCours ? "…" : "Retirer"}
    </button>
  );
}
