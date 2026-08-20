"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerCentre, modifierCentre } from "@/actions/centres";
import { VIDE } from "@/actions/etat";
import type { Centre, Etude } from "@/db/schema";
import { NIVEAUX_RISQUE, STATUTS_CENTRE } from "@/lib/constantes";
import { versChampDate } from "@/lib/format";

function Envoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

export default function FormulaireCentre({
  etudes,
  centre,
  libelle = "Ajouter un centre",
  etudeIdDefaut,
}: {
  etudes: Etude[];
  centre?: Centre;
  libelle?: string;
  etudeIdDefaut?: number;
}) {
  const [ouverte, setOuverte] = useState(false);
  const [etat, action] = useActionState(centre ? modifierCentre : creerCentre, VIDE);
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
      <button type="button" className="bouton" onClick={() => setOuverte(true)}>
        {libelle}
      </button>
      <Modale ouverte={ouverte} onFermer={() => setOuverte(false)} titre={libelle} large>
        <form action={action} className="space-y-4 p-5">
          {centre && <input type="hidden" name="id" value={centre.id} />}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Étude</label>
            <select
              name="etudeId"
              required
              defaultValue={centre?.etudeId ?? etudeIdDefaut ?? ""}
              className="champ"
            >
              <option value="">Choisir…</option>
              {etudes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code ?? e.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">N°</label>
              <input name="numero" required defaultValue={centre?.numero ?? ""} className="champ" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nom</label>
              <input name="nom" required defaultValue={centre?.nom ?? ""} className="champ" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Établissement</label>
            <input name="etablissement" defaultValue={centre?.etablissement ?? ""} className="champ" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Investigateur principal</label>
            <input
              name="investigateurPrincipal"
              defaultValue={centre?.investigateurPrincipal ?? ""}
              className="champ"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Statut</label>
              <select name="statut" defaultValue={centre?.statut ?? "en_selection"} className="champ">
                {Object.entries(STATUTS_CENTRE).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Risque</label>
              <select name="risque" defaultValue={centre?.risque ?? "modere"} className="champ">
                {Object.entries(NIVEAUX_RISQUE).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Objectif d&apos;inclusion</label>
              <input
                name="objectifInclusion"
                type="number"
                min={0}
                defaultValue={centre?.objectifInclusion ?? ""}
                className="champ"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Activation</label>
              <input
                name="dateActivation"
                type="date"
                defaultValue={versChampDate(centre?.dateActivation)}
                className="champ"
              />
            </div>
          </div>
          {etat.erreur && <p className="text-sm text-alerte">{etat.erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="bouton-discret" onClick={() => setOuverte(false)}>
              Annuler
            </button>
            <Envoyer libelle="Enregistrer" />
          </div>
        </form>
      </Modale>
    </>
  );
}
