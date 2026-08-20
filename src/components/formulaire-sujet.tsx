"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerSujet } from "@/actions/sujets";
import { VIDE } from "@/actions/etat";
import type { Centre, Etude } from "@/db/schema";
import { STATUTS_SUJET } from "@/lib/constantes";

function Envoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : "Créer le sujet"}
    </button>
  );
}

export default function FormulaireSujet({
  etudes,
  centres,
  libelle = "Ajouter un sujet",
}: {
  etudes: Etude[];
  centres: Centre[];
  libelle?: string;
}) {
  const [ouverte, setOuverte] = useState(false);
  const [etudeId, setEtudeId] = useState<string>("");
  const [etat, action] = useActionState(creerSujet, VIDE);
  const vu = useRef(0);
  useEffect(() => {
    const s = etat.succes ?? 0;
    if (s > vu.current) {
      vu.current = s;
      setOuverte(false);
    }
  }, [etat.succes]);

  const centresFiltres = centres.filter((c) => !etudeId || String(c.etudeId) === etudeId);

  return (
    <>
      <button type="button" className="bouton" onClick={() => setOuverte(true)}>
        {libelle}
      </button>
      <Modale ouverte={ouverte} onFermer={() => setOuverte(false)} titre="Nouveau sujet">
        <form action={action} className="space-y-4 p-5">
          <p className="text-xs text-attenue">
            Identifiant uniquement (Subject ID). Pas de nom, pas de date de naissance.
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Étude</label>
            <select
              name="etudeId"
              required
              className="champ"
              value={etudeId}
              onChange={(e) => setEtudeId(e.target.value)}
            >
              <option value="">Choisir…</option>
              {etudes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code ?? e.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Centre</label>
            <select name="centreId" className="champ">
              <option value="">—</option>
              {centresFiltres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero} — {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Subject ID</label>
            <input name="subjectId" placeholder="Laissé vide = attribué automatiquement" className="champ" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Statut</label>
              <select name="statut" defaultValue="screening" className="champ">
                {Object.entries(STATUTS_SUJET).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bras</label>
              <input name="bras" className="champ" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Date de screening</label>
              <input name="dateScreening" type="date" className="champ" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Date d&apos;inclusion</label>
              <input name="dateInclusion" type="date" className="champ" />
            </div>
          </div>
          {etat.erreur && <p className="text-sm text-alerte">{etat.erreur}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="bouton-discret" onClick={() => setOuverte(false)}>
              Annuler
            </button>
            <Envoyer />
          </div>
        </form>
      </Modale>
    </>
  );
}
