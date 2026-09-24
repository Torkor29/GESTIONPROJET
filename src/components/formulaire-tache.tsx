"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import ChoixEtudes, { type EtudeChoisissable } from "./choix-etudes";
import Modale from "./modale";
import { creerTache, modifierTache } from "@/actions/taches";
import { VIDE } from "@/actions/etat";
import type { Tache } from "@/db/schema";
import { TYPES_MISSION_SUGGERES } from "@/lib/constantes";
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
  etudesLiees = [],
  etudes,
  etudeIdParDefaut,
  typesConnus = [],
  libelle,
  variante = "principal",
}: {
  tache?: Tache;
  /** Études d'une mission multi-études, en édition. */
  etudesLiees?: number[];
  etudes: EtudeChoisissable[];
  etudeIdParDefaut?: number;
  /** Types déjà employés, proposés en plus des suggestions. */
  typesConnus?: string[];
  libelle: string;
  variante?: "principal" | "discret" | "icone";
}) {
  // Plusieurs de ces formulaires cohabitent sur une même page : les identifiants
  // doivent être uniques, sinon les libellés pointent vers le mauvais champ.
  const uid = useId();
  const [ouverte, setOuverte] = useState(false);
  const edition = Boolean(tache);
  const multi = etudesLiees.length > 0;
  const selectionInitiale = multi
    ? etudesLiees
    : tache
      ? tache.etudeId
        ? [tache.etudeId]
        : []
      : etudeIdParDefaut
        ? [etudeIdParDefaut]
        : [];
  const types = [...new Set([...TYPES_MISSION_SUGGERES, ...typesConnus])];
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
    icone: "rounded-lg px-2 py-1 text-sm text-attenue transition hover:bg-creux hover:text-accent",
  }[variante];

  return (
    <>
      <button
        type="button"
        onClick={() => setOuverte(true)}
        title={edition ? "Modifier la mission" : undefined}
        aria-label={edition ? "Modifier la mission" : undefined}
        className={classes}
      >
        {libelle}
      </button>

      <Modale
        ouverte={ouverte}
        onFermer={() => setOuverte(false)}
        titre={edition ? "Modifier la mission" : "Nouvelle mission"}
        large
      >
        {/* La clé suit la date de modification de l'enregistrement.
            Sans elle, les champs gardent la valeur qu'ils avaient au montage :
            changer le statut depuis le tableau puis modifier la mission
            réécrirait l'ancien statut, annulant silencieusement le changement.
            `defaultValue` ne se relit qu'au montage — la clé force ce montage.
            Le compteur de succès la complète : le choix des études vit dans
            un état React, qu'il faut repartir de zéro après chaque ajout. */}
        <form key={`${tache?.modifieLe ?? "nouvelle"}-${etat.succes ?? 0}`} action={action} className="space-y-4">
          {edition && <input type="hidden" name="id" value={tache!.id} />}

          <div>
            <label htmlFor={`${uid}-titre`} className="mb-1.5 block text-sm font-medium">
              Mission
            </label>
            <input
              id={`${uid}-titre`}
              name="titre"
              required
              autoFocus
              defaultValue={tache?.titre}
              placeholder="Déclaration de fin d'étude à l'ANSM"
              className="champ"
            />
          </div>

          <div>
            <label htmlFor={`${uid}-type`} className="mb-1.5 block text-sm font-medium">
              Type <span className="font-normal text-attenue">(facultatif)</span>
            </label>
            <input
              id={`${uid}-type`}
              name="type"
              list={`${uid}-types`}
              defaultValue={tache?.type ?? ""}
              placeholder="Archivage, Soumission, Clôture…"
              autoComplete="off"
              className="champ"
            />
            <datalist id={`${uid}-types`}>
              {types.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor={`${uid}-etudes`} className="mb-1.5 block text-sm font-medium">
              Études
            </label>
            <ChoixEtudes
              id={`${uid}-etudes`}
              etudes={etudes}
              selectionInitiale={selectionInitiale}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${uid}-priorite`} className="mb-1.5 block text-sm font-medium">
                Priorité
              </label>
              <select
                id={`${uid}-priorite`}
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
              <label htmlFor={`${uid}-echeance`} className="mb-1.5 block text-sm font-medium">
                Échéance
              </label>
              <input
                id={`${uid}-echeance`}
                name="echeance"
                type="date"
                defaultValue={versChampDate(tache?.echeance)}
                className="champ"
              />
            </div>
          </div>

          {edition && multi && (
            <p className="text-xs text-attenue">
              Le statut de cette mission suit celui de ses études : il se change
              étude par étude, depuis le tableau des missions.
            </p>
          )}

          {edition && !multi && (
            <div>
              <label htmlFor={`${uid}-statut`} className="mb-1.5 block text-sm font-medium">
                Statut
              </label>
              <select id={`${uid}-statut`} name="statut" defaultValue={tache!.statut} className="champ">
                {Object.entries(LIBELLES_STATUT_TACHE).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor={`${uid}-notes`} className="mb-1.5 block text-sm font-medium">
              Commentaire <span className="font-normal text-attenue">(facultatif)</span>
            </label>
            <textarea
              id={`${uid}-notes`}
              name="notes"
              rows={2}
              defaultValue={tache?.notes ?? ""}
              className="champ resize-y"
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
