"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Modale from "./modale";
import { creerTache, modifierTache } from "@/actions/taches";
import { VIDE } from "@/actions/etat";
import type { Etude, Tache } from "@/db/schema";
import { LIBELLES_PRIORITE, LIBELLES_STATUT_TACHE, versChampDate } from "@/lib/format";

function BoutonEnvoyer({ libelle }: { libelle: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bouton" disabled={pending}>
      {pending ? "Enregistrement…" : libelle}
    </button>
  );
}

export default function FormulaireTache({
  tache,
  etudes,
  etudeIdParDefaut,
  libelle,
  variante = "principal",
}: {
  tache?: Tache;
  etudes: Pick<Etude, "id" | "nom">[];
  etudeIdParDefaut?: number;
  libelle: string;
  variante?: "principal" | "discret" | "icone";
}) {
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(tache);
  const [etat, action] = useActionState(edition ? modifierTache : creerTache, VIDE);

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
    icone: "rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-line/60 hover:text-accent",
  }[variante];

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        title={edition ? "Modifier la tâche" : undefined}
        aria-label={edition ? "Modifier la tâche" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier la tâche" : "Nouvelle tâche"}
      >
        <form action={action} className="space-y-4">
          {edition && <input type="hidden" name="id" value={tache!.id} />}

          <div>
            <label htmlFor="titre" className="mb-1.5 block text-sm font-medium">
              Tâche
            </label>
            <input
              id="titre"
              name="titre"
              required
              autoFocus
              defaultValue={tache?.titre}
              placeholder="Rédiger la note de calcul"
              className="champ"
            />
          </div>

          <div>
            <label htmlFor="etudeId" className="mb-1.5 block text-sm font-medium">
              Étude
            </label>
            <select
              id="etudeId"
              name="etudeId"
              defaultValue={tache?.etudeId ?? etudeIdParDefaut ?? ""}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="priorite" className="mb-1.5 block text-sm font-medium">
                Priorité
              </label>
              <select
                id="priorite"
                name="priorite"
                defaultValue={tache?.priorite ?? "normale"}
                className="champ"
              >
                {Object.entries(LIBELLES_PRIORITE).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="echeance" className="mb-1.5 block text-sm font-medium">
                Échéance
              </label>
              <input
                id="echeance"
                name="echeance"
                type="date"
                defaultValue={versChampDate(tache?.echeance)}
                className="champ"
              />
            </div>
          </div>

          {edition && (
            <div>
              <label htmlFor="statut" className="mb-1.5 block text-sm font-medium">
                Statut
              </label>
              <select id="statut" name="statut" defaultValue={tache!.statut} className="champ">
                {Object.entries(LIBELLES_STATUT_TACHE).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
              Notes <span className="font-normal text-muted">(facultatif)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={tache?.notes ?? ""}
              className="champ resize-y"
            />
          </div>

          {etat.erreur && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
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
