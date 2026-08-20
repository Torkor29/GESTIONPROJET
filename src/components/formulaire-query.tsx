"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerQuery } from "@/actions/queries";
import { VIDE } from "@/actions/etat";
import type { Centre, Etude, Sujet } from "@/db/schema";
import { TYPES_QUERY } from "@/lib/constantes";

function Envoyer() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Création…" : "Ouvrir la query"}
    </button>
  );
}

export default function FormulaireQuery({
  etudes,
  centres,
  sujets,
}: {
  etudes: Etude[];
  centres: Centre[];
  sujets: Sujet[];
}) {
  const [ouverte, setOuverte] = useState(false);
  const [etudeId, setEtudeId] = useState("");
  const [etat, action] = useActionState(creerQuery, VIDE);
  const vu = useRef(0);
  useEffect(() => {
    const s = etat.succes ?? 0;
    if (s > vu.current) {
      vu.current = s;
      setOuverte(false);
    }
  }, [etat.succes]);

  const centresF = centres.filter((c) => !etudeId || String(c.etudeId) === etudeId);
  const sujetsF = sujets.filter((s) => !etudeId || String(s.etudeId) === etudeId);

  return (
    <>
      <button type="button" className="bouton" onClick={() => setOuverte(true)}>
        Nouvelle query
      </button>
      <Modale ouverte={ouverte} onFermer={() => setOuverte(false)} titre="Nouvelle query" large>
        <form action={action} className="space-y-4 p-5">
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Centre</label>
              <select name="centreId" className="champ">
                <option value="">—</option>
                {centresF.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numero} — {c.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sujet</label>
              <select name="sujetId" className="champ">
                <option value="">—</option>
                {sujetsF.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subjectId}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Type</label>
            <select name="type" className="champ" defaultValue="clarification">
              {Object.entries(TYPES_QUERY).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea name="description" required rows={4} className="champ" />
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
